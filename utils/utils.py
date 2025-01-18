import pypdfium2 as pdfium

def extract_text_from_pdf(pdf_file):
    text = ""
    pdf = pdfium.PdfDocument(pdf_file)
    for page_num in range(len(pdf)):
        page = pdf[page_num]
        text_page = page.get_textpage()
        text += text_page.get_text_range()
    return text