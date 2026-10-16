import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()

    # Standard margins (Top 2cm, Bottom 2cm, Left 2.5cm, Right 2cm)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(0.8)

    # Document Header / Subtitle
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("BÁO CÁO ĐẶC TẢ DỰ ÁN TỐT NGHIỆP / THỰC TẬP")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(12)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0x59, 0x59, 0x59)

    # Main Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(14)
    r_title = p_title.add_run("HỆ THỐNG TRA CỨU VÀ CHIA SẺ HỌC LIỆU TRỰC TUYẾN TÍCH HỢP AI\n(EDUMARKET)")
    r_title.font.name = 'Times New Roman'
    r_title.font.size = Pt(16)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

    # Divider line
    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_div.paragraph_format.space_after = Pt(16)
    r_div = p_div.add_run("―" * 38)
    r_div.font.color.rgb = RGBColor(0x8F, 0xAA, 0xDC)

    # Helper functions
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(14)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x2E, 0x75, 0xB6)
        return p

    def add_body(text, space_after=6):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.25
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.25
        if bold_prefix:
            r_b = p.add_run(bold_prefix)
            r_b.font.name = 'Times New Roman'
            r_b.font.size = Pt(12)
            r_b.font.bold = True
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        return p

    # --- 1. NHU CẦU & THỰC TRẠNG ---
    add_h1("1. NHU CẦU & THỰC TRẠNG")
    add_h2("1.1. Thực trạng nguồn học liệu phân tán và khó tìm kiếm")
    add_body("Trong thời đại chuyển đổi số giáo dục, nhu cầu tiếp cận và trao đổi tài liệu học tập, giáo trình, bài giảng và đề thi của người học lẫn giảng viên là cực kỳ lớn. Tuy nhiên, thực tế đang tồn tại nhiều bất cập:")
    add_bullet(" Hiện nay, học liệu điện tử phân tán rải rác trên nhiều diễn đàn, mạng xã hội (Facebook groups, Zalo) hoặc các dịch vụ lưu trữ đám mây cá nhân (Google Drive, Dropbox) không có sự tổ chức tập trung.", bold_prefix="Nguồn tài liệu phân tán:")
    add_bullet(" Các công cụ tìm kiếm thông thường chỉ so khớp từ khóa cơ bản, thường trả về kết quả rác, tài liệu không đúng định dạng mong muốn (.pdf, .docx, .pptx) hoặc tài liệu đã lỗi thời, gây lãng phí nhiều thời gian tra cứu.", bold_prefix="Khó khăn trong tra cứu chính xác:")
    add_bullet(" Thiếu cơ chế kiểm định chất lượng nội dung trước khi tải về; người dùng thường tải phải tài liệu lỗi font, thiếu trang hoặc nội dung sai lệch.", bold_prefix="Chất lượng học liệu không đồng đều:")

    add_h2("1.2. Hạn chế trong chia sẻ và thương mại hóa tài liệu (Đánh giá thủ công)")
    add_bullet(" Nhiều giáo viên và sinh viên có kho học liệu chất lượng cao muốn chia sẻ có thu phí để tạo động lực sáng tạo nhưng thiếu một nền tảng trung gian bảo vệ quyền lợi và thanh toán an toàn.", bold_prefix="Thiếu nền tảng giao dịch minh bạch:")
    add_bullet(" Quy trình đánh giá chất lượng tài liệu còn tự phát; thiếu hệ thống đánh giá sao (rating), nhận xét (review) thực tế từ những người đã sử dụng và thiếu tính năng xem trước (preview) nội dung tài liệu.", bold_prefix="Đánh giá chất lượng thủ công:")
    add_bullet(" Khi phát sinh sự cố về file tải lỗi, trùng lặp hoặc khiếu nại giao dịch, các kênh hỗ trợ truyền thống phản hồi rất chậm chạp do không có công cụ phân loại khiếu nại tự động.", bold_prefix="Xử lý hỗ trợ khách hàng chậm trễ:")

    # --- 2. ĐẶC TẢ BÀI TOÁN ---
    add_h1("2. ĐẶC TẢ BÀI TOÁN")
    add_h2("2.1. Mục tiêu bài toán")
    add_body("Xây dựng nền tảng website thương mại điện tử chuyên biệt hóa cho việc Tra cứu, Chia sẻ và Giao dịch học liệu số (EduMarket). Nền tảng ứng dụng công nghệ trí tuệ nhân tạo (AI) nhằm tối ưu hóa khả năng tìm kiếm, phân tích hành vi người dùng để đề xuất học liệu phù hợp và tự động hóa quy trình hỗ trợ người dùng.")

    add_h2("2.2. Tra cứu thông minh và Đánh giá chất lượng học liệu")
    add_bullet(" Cung cấp bộ lọc thông minh kết hợp nhiều tiêu chí: môn học, khối lớp/cấp học, định dạng tệp (PDF, Word, PowerPoint), mức giá (miễn phí hoặc trả phí) và hệ thống gắn thẻ chuyên đề (tags).", bold_prefix="Bộ lọc tra cứu đa tiêu chí:")
    add_bullet(" Cho phép người dùng xem trước một phần nội dung tài liệu (Preview) và hình ảnh đại diện (Thumbnail) trước khi quyết định mua hoặc tải về.", bold_prefix="Cơ chế xem trước tài liệu:")
    add_bullet(" Thiết lập hệ thống đánh giá 1-5 sao, viết nhận xét kèm phản hồi chính thức từ tác giả bán tài liệu (Seller Reply), đảm bảo tính minh bạch và độ tin cậy của học liệu.", bold_prefix="Hệ thống đánh giá & phản hồi hai chiều:")

    add_h2("2.3. Đề xuất học liệu phù hợp & Tích hợp AI")
    add_bullet(" Ghi nhận các hành vi tương tác của người dùng trên hệ thống (Lượt xem, Click, Thêm vào giỏ hàng, Lịch sử mua) để phân tích sở thích và tự động gợi ý các tài liệu liên quan mật thiết đến chủ đề đang quan tâm.", bold_prefix="Thuật toán gợi ý cá nhân hóa (Recommendation Engine):")
    add_bullet(" Ứng dụng mô hình AI (Google Gemini) để tự động phân tích nội dung ticket khiếu nại của người dùng, phân loại danh mục (Thanh toán, Lỗi kỹ thuật, Báo cáo nội dung) và gợi ý câu trả lời nhanh chóng cho đội ngũ hỗ trợ.", bold_prefix="Hỗ trợ thông minh với AI:")

    # --- 3. ĐẶC TẢ YÊU CẦU HỆ THỐNG ---
    add_h1("3. ĐẶC TẢ YÊU CẦU HỆ THỐNG")
    add_h2("3.1. Đối tượng sử dụng & Phân quyền hệ thống")
    add_bullet(" Đăng ký/đăng nhập tài khoản, tra cứu học liệu đa năng, xem trước nội dung, nạp tiền vào ví nội bộ, mua và tải học liệu, áp dụng mã giảm giá (Coupon), đánh giá tài liệu đã mua và gửi ticket hỗ trợ.", bold_prefix="1. Người tìm kiếm / Người mua (Learner / Buyer):")
    add_bullet(" Đăng tải tài liệu (tải file lên Cloudinary, nhập thông tin mô tả, chọn danh mục, định dạng, đặt giá bán), quản lý danh sách tài liệu cá nhân, tạo mã giảm giá (Coupon) khuyến mãi và phản hồi nhận xét của khách hàng.", bold_prefix="2. Người chia sẻ / Người bán (Provider / Seller):")
    add_bullet(" Kiểm duyệt học liệu mới đăng (Phê duyệt hoặc Từ chối kèm lý do), quản lý tài khoản người dùng, xử lý các ticket khiếu nại có AI hỗ trợ, giám sát giao dịch dòng tiền và theo dõi Dashboard thống kê hệ thống.", bold_prefix="3. Quản trị viên (Admin):")

    add_h2("3.2. Bảng phân rã chức năng hệ thống")
    
    # Table
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    widths = [Inches(1.5), Inches(2.0), Inches(3.2)]
    hdr_cells = table.rows[0].cells
    hdr_titles = ["Phân hệ (Module)", "Chức năng chính", "Mô tả chi tiết"]
    for i, title in enumerate(hdr_titles):
        hdr_cells[i].width = widths[i]
        set_cell_background(hdr_cells[i], "1F4E79")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=150, right=150)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(title)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    data = [
        ("Tra cứu & Tìm kiếm",
         "• Tìm kiếm từ khóa\n• Bộ lọc đa chiều\n• Gợi ý học liệu",
         "- Tìm nhanh theo tên, mô tả, thẻ tags.\n- Lọc theo định dạng file, mức giá, danh mục môn học.\n- Đề xuất tài liệu liên quan dựa trên hành vi tương tác."),
        ("Quản lý Học liệu",
         "• Upload file học liệu\n• Kiểm duyệt nội dung\n• Đánh giá & Phản hồi",
         "- Tải tệp tài liệu và ảnh đại diện lên Cloudinary.\n- Admin kiểm duyệt (Approved/Rejected) trước khi xuất hiện công khai.\n- Người mua chấm điểm sao, nhận xét; tác giả phản hồi bình luận."),
        ("Ví điện tử & Giao dịch",
         "• Ví nội bộ (Wallet)\n• Thanh toán đơn hàng\n• Quản lý Coupon",
         "- Nạp tiền, trừ tiền tức thì khi mua học liệu.\n- Tác giả nhận doanh thu vào ví và theo dõi lịch sử số dư.\n- Tạo mã giảm giá (Coupon) theo phần trăm và giới hạn số lượt dùng."),
        ("Chăm sóc khách hàng & AI",
         "• Gửi Ticket hỗ trợ\n• Phân loại tự động\n• Gợi ý trả lời với AI",
         "- Người dùng gửi khiếu nại (lỗi file, thanh toán).\n- Tích hợp Gemini AI phân loại tự động danh mục khiếu nại.\n- AI đề xuất câu trả lời chuẩn xác cho Admin.")
    ]

    for row_idx, row_data in enumerate(data):
        row_cells = table.add_row().cells
        bg_color = "F2F2F2" if row_idx % 2 == 1 else "FFFFFF"
        for i in range(3):
            row_cells[i].width = widths[i]
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=100, bottom=100, left=150, right=150)
            p = row_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(row_data[i])
            run.font.name = 'Times New Roman'
            run.font.size = Pt(10.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_h2("3.3. Yêu cầu phi chức năng (Non-Functional Requirements)")
    add_bullet(" Tốc độ tìm kiếm và trả kết quả dưới 1 giây; thao tác xem trước mượt mà.", bold_prefix="Hiệu năng tra cứu:")
    add_bullet(" Toàn bộ file tài liệu được lưu trữ an toàn trên hệ thống đám mây; dữ liệu người dùng và mật khẩu được mã hóa an toàn.", bold_prefix="Bảo mật & Toàn vẹn dữ liệu:")
    add_bullet(" Giao diện tương thích (Responsive) hoàn hảo trên cả máy tính để bàn (PC), Laptop và thiết bị di động (Smartphone/Tablet).", bold_prefix="Tính khả dụng:")

    add_h2("3.4. Thống nhất tiêu chí thành công của dự án (Success Criteria)")
    add_bullet(" Hệ thống tra cứu hoạt động ổn định, chính xác với thời gian phản hồi truy vấn dưới 1 giây.", bold_prefix="1. Tối ưu hóa tra cứu:")
    add_bullet(" 100% học liệu công khai trên nền tảng được kiểm duyệt chất lượng nghiêm ngặt bởi Admin trước khi mở bán.", bold_prefix="2. Kiểm soát chất lượng:")
    add_bullet(" 100% các giao dịch mua bán, trừ tiền ví cá nhân, cộng doanh thu cho tác giả và chiết khấu Coupon diễn ra chính xác tuyệt đối, không có sai lệch số dư.", bold_prefix="3. An toàn giao dịch:")
    add_bullet(" AI phân loại chính xác các ticket khiếu nại trên 85%, giúp giảm thời gian phản hồi hỗ trợ người dùng xuống dưới 5 phút.", bold_prefix="4. Hiệu quả ứng dụng AI:")
    add_bullet(" Quy trình từ tìm kiếm đến mua và tải tài liệu được tối ưu hóa chỉ trong vòng 3 bước thao tác đơn giản.", bold_prefix="5. Trải nghiệm người dùng:")

    # Save file
    output_path = r"d:\DOANTTTN\Bao_Cao_Dac_Ta_De_Tai_Tra_Cuu_Hoc_Lieu.docx"
    doc.save(output_path)
    print(f"SUCCESS: Saved file to {output_path}")

if __name__ == '__main__':
    create_document()
