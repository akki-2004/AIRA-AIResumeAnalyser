const pdf = require("pdf-parse");
console.log("Type of pdf.PDFParse:", typeof pdf.PDFParse);

try {
    console.log("Calling pdf.PDFParse() directly...");
    pdf.PDFParse(Buffer.from("test"));
} catch (e) {
    console.log("Error calling directly:", e.message);
}

try {
    console.log("Calling new pdf.PDFParse()...");
    const instance = new pdf.PDFParse(Buffer.from("test"));
    console.log("Instance created:", instance);
} catch (e) {
    console.log("Error calling new:", e.message);
}



