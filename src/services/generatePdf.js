import { ApiError } from "../utils/apiError.js"
import PDFDocument from "pdfkit";

export const generatePdf = async (req, res) => {
    try {
        const { type, images } = req.body

        if (!type || !images || images.length === 0) {
            throw new ApiError(400, "Failed to get required things!!")
        }

        const doc = new PDFDocument({ autoFirstPage: false })

        res.setHeader("Content-Disposition", "attachment; filename=notes.pdf");
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        const imageBuffers = await Promise.all(
            images.map(async (url) => {
                const response = await fetch(url)
                const arrayBuffer = await response.arrayBuffer()
                return Buffer.from(arrayBuffer)
            })
        )

        imageBuffers.forEach(imageBuffer => {
            const img = doc.openImage(imageBuffer);
            doc.addPage({ size: [img.width, img.height] });
            doc.image(imageBuffer, 0, 0, { width: img.width, height: img.height });
        })

        doc.end();
    } catch (error) {
        console.error("Failed to create PDF " + error)
        throw new ApiError(500, "Failed to create PDF " + error)
    }
}