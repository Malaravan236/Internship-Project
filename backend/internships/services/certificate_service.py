from io import BytesIO
from django.core.files.base import ContentFile

def build_certificate_pdf_bytes(student_name: str, internship_title: str, cert_no: str, token: str) -> bytes:
    from reportlab.pdfgen import canvas

    buf = BytesIO()
    c = canvas.Canvas(buf)

    c.setFont("Helvetica-Bold", 20)
    c.drawString(140, 760, "Certificate of Completion")

    c.setFont("Helvetica", 12)
    c.drawString(80, 700, f"This is to certify that {student_name}")
    c.drawString(80, 680, "has successfully completed the internship:")

    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, 660, internship_title)

    c.setFont("Helvetica", 10)
    c.drawString(80, 620, f"Certificate No: {cert_no}")
    c.drawString(80, 605, f"Verify Token: {token}")

    c.showPage()
    c.save()

    buf.seek(0)
    return buf.read()


def attach_pdf_to_certificate(certificate, student_name: str, internship_title: str):
    pdf_bytes = build_certificate_pdf_bytes(
        student_name=student_name,
        internship_title=internship_title,
        cert_no=certificate.certificate_no,
        token=str(certificate.verify_token),
    )
    certificate.pdf.save(
        f"{certificate.certificate_no}.pdf",
        ContentFile(pdf_bytes),
        save=True,
    )
    return certificate
