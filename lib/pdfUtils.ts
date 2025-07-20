// Utility function to extract text from PDF using a simple approach
// Note: For production, consider using a more robust PDF parsing library

export async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    const response = await fetch('/api/extract-pdf-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdfUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to extract text from PDF');
    }

    const data = await response.json();

    if (data.success && data.text) {
      return data.text;
    } else {
      // Return empty string to indicate manual input is needed
      return '';
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    // Return empty string to indicate manual input is needed
    return '';
  }
}

// Alternative approach: Ask user to paste resume text manually when PDF is selected
export function createResumeTextPrompt(resumeName: string): string {
  return `Please copy and paste the text content from your resume "${resumeName}" in the text area below for analysis.`;
}
