import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // Use Node.js runtime for pdf-parse

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || "pdfs";

export async function GET(request: NextRequest) {
  try {
    // Get filename from query parameters
    const searchParams = request.nextUrl.searchParams;
    let filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "Filename parameter is required" },
        { status: 400 }
      );
    }

    // Auto-append .pdf extension if missing
    if (!filename.toLowerCase().endsWith('.pdf')) {
      console.log(`[get-pdf] Auto-appending .pdf extension to: ${filename}`);
      filename = `${filename}.pdf`;
    }

    console.log(`[get-pdf] Attempting to fetch PDF: ${filename}`);
    console.log(`[get-pdf] Bucket: ${bucketName}`);

    // Validate Supabase configuration
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[get-pdf] Missing Supabase configuration");
      return NextResponse.json(
        { error: "Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env" },
        { status: 500 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // List files in bucket to help debug
    const { data: fileList } = await supabase.storage
      .from(bucketName)
      .list();

    if (fileList) {
      console.log(`[get-pdf] Available files in bucket:`, fileList.map(f => f.name));
    }

    // Download PDF from Supabase Storage
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(filename);

    if (downloadError) {
      console.error("[get-pdf] Error downloading PDF from Supabase:", {
        filename,
        bucket: bucketName,
        error: downloadError,
        supabaseUrl,
      });
      return NextResponse.json(
        {
          error: `Failed to download PDF: ${downloadError.message}`,
          details: {
            filename,
            bucket: bucketName,
            availableFiles: fileList?.map(f => f.name) || []
          }
        },
        { status: 404 }
      );
    }

    console.log(`[get-pdf] Successfully downloaded: ${filename}`);

    // Convert Blob to Buffer for pdf-parse
    const arrayBuffer = await pdfData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF to extract text content
    let extractedText = "";
    let totalPages = 0;
    try {
      // Use require for pdf-parse (CommonJS module in Node.js runtime)
      const pdfParse = require("pdf-parse");
      const pdfContent = await pdfParse(buffer);
      extractedText = pdfContent.text;
      totalPages = pdfContent.numpages;
    } catch (parseError) {
      console.error("Error parsing PDF:", parseError);
      // Continue even if parsing fails - we'll still return the PDF URL
    }

    // Get public URL for the PDF
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      filename,
      pdfUrl: urlData.publicUrl,
      extractedText,
      totalPages,
    });
  } catch (error) {
    console.error("Unexpected error in get-pdf API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
