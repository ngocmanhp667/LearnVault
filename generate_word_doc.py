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

    # Standard margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(0.8)

    # Document Header
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
    r_title = p_title.add_run("XÂY DỰNG SÀN GIAO DỊCH HỌC LIỆU TRỰC TUYẾN\nTÍCH HỢP TRÍ TUỆ NHÂN TẠO\n(LEARNVAULT)")
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

    # ── Helper functions ──
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
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

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.italic = True
        r.font.color.rgb = RGBColor(0x40, 0x40, 0x40)
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

    def add_table(headers, data, col_widths):
        """Tạo bảng với header và dữ liệu."""
        table = doc.add_table(rows=1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        hdr_cells = table.rows[0].cells
        for i, title in enumerate(headers):
            hdr_cells[i].width = col_widths[i]
            set_cell_background(hdr_cells[i], "1F4E79")
            set_cell_margins(hdr_cells[i], top=120, bottom=120, left=150, right=150)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(title)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        for row_idx, row_data in enumerate(data):
            row_cells = table.add_row().cells
            bg_color = "F2F2F2" if row_idx % 2 == 1 else "FFFFFF"
            for i in range(len(headers)):
                row_cells[i].width = col_widths[i]
                set_cell_background(row_cells[i], bg_color)
                set_cell_margins(row_cells[i], top=100, bottom=100, left=150, right=150)
                p = row_cells[i].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.line_spacing = 1.15
                run = p.add_run(row_data[i])
                run.font.name = 'Times New Roman'
                run.font.size = Pt(10.5)

        doc.add_paragraph().paragraph_format.space_after = Pt(8)
        return table

    # ═══════════════════════════════════════════════════════════════
    # PHẦN 1: NHU CẦU THỰC TẾ
    # ═══════════════════════════════════════════════════════════════
    add_h1("1. NHU CẦU THỰC TẾ")

    add_h2("1.1. Bối cảnh chuyển đổi số trong giáo dục")
    add_body(
        "Trong bối cảnh chuyển đổi số giáo dục đang diễn ra mạnh mẽ tại Việt Nam và trên thế giới, "
        "nhu cầu tiếp cận, chia sẻ và trao đổi tài liệu học tập số (giáo trình, bài giảng, đề thi, "
        "slide, tóm tắt môn học) của sinh viên, giảng viên và người tự học ngày càng tăng cao. "
        "Đặc biệt sau giai đoạn đại dịch COVID-19, việc học trực tuyến đã trở thành xu thế không thể đảo ngược, "
        "kéo theo sự bùng nổ nhu cầu về tài liệu số chất lượng."
    )

    add_h2("1.2. Nhu cầu từ phía người học (Buyer / Learner)")
    add_bullet(
        " Sinh viên cần tìm nhanh tài liệu ôn thi, giáo trình, bài tập mẫu cho từng môn học cụ thể "
        "nhưng không biết nguồn nào đáng tin cậy.",
        bold_prefix="Tìm kiếm tài liệu nhanh chóng và chính xác:"
    )
    add_bullet(
        " Người học muốn biết tài liệu có chất lượng hay không trước khi bỏ tiền mua — "
        "cần xem trước nội dung (thumbnail, mô tả chi tiết), đọc đánh giá sao và nhận xét từ người đã mua.",
        bold_prefix="Đánh giá chất lượng trước khi mua:"
    )
    add_bullet(
        " Hệ thống có thể hiểu sở thích, lịch sử học tập và tự động đề xuất tài liệu phù hợp "
        "thay vì phải duyệt thủ công hàng trăm kết quả.",
        bold_prefix="Gợi ý cá nhân hóa:"
    )
    add_bullet(
        " Quy trình từ tìm kiếm → xem trước → thanh toán → tải tài liệu cần đơn giản, nhanh gọn, "
        "không quá 3 bước thao tác.",
        bold_prefix="Trải nghiệm mua sắm tiện lợi:"
    )

    add_h2("1.3. Nhu cầu từ phía người bán / chia sẻ (Seller / Provider)")
    add_bullet(
        " Nhiều giảng viên, sinh viên giỏi và chuyên gia có kho tài liệu chất lượng cao (slide bài giảng, "
        "tài liệu tóm tắt, bộ đề thi) muốn chia sẻ có thu phí để tạo động lực sáng tạo, "
        "nhưng chưa có nền tảng trung gian phù hợp.",
        bold_prefix="Thương mại hóa tài liệu cá nhân:"
    )
    add_bullet(
        " Cần quản lý doanh thu trực quan (biểu đồ, thống kê lượt bán, tổng thu nhập), "
        "theo dõi phản hồi khách hàng và có công cụ marketing cơ bản (mã giảm giá Coupon).",
        bold_prefix="Quản lý kinh doanh tài liệu:"
    )
    add_bullet(
        " Người bán muốn biết khách hàng đánh giá sản phẩm của mình như thế nào "
        "và có khả năng phản hồi lại nhận xét (Seller Reply) để nâng cao uy tín.",
        bold_prefix="Tương tác với khách hàng:"
    )

    add_h2("1.4. Nhu cầu từ phía quản trị (Admin)")
    add_bullet(
        " Kiểm duyệt nội dung học liệu đăng tải (Approve / Reject) trước khi công khai trên sàn "
        "để đảm bảo chất lượng và bản quyền.",
        bold_prefix="Kiểm duyệt chất lượng nội dung:"
    )
    add_bullet(
        " Dashboard thống kê toàn diện: tổng người dùng, tổng giao dịch, doanh thu, "
        "học liệu bán chạy, phân tích xu hướng.",
        bold_prefix="Giám sát vận hành hệ thống:"
    )
    add_bullet(
        " Xử lý nhanh các ticket khiếu nại từ người dùng; cần AI tự động phân loại vấn đề "
        "và gợi ý câu trả lời chuẩn để giảm thời gian phản hồi.",
        bold_prefix="Hỗ trợ khách hàng hiệu quả:"
    )

    # ═══════════════════════════════════════════════════════════════
    # PHẦN 2: KHẢO SÁT HIỆN TRẠNG
    # ═══════════════════════════════════════════════════════════════
    add_h1("2. KHẢO SÁT HIỆN TRẠNG")

    add_h2("2.1. Thực trạng chia sẻ tài liệu học tập hiện nay")
    add_body(
        "Hiện nay, việc chia sẻ và trao đổi tài liệu học tập của sinh viên Việt Nam đang diễn ra "
        "một cách tự phát, phân tán trên nhiều kênh không chuyên biệt:"
    )
    add_bullet(
        " Tài liệu được chia sẻ rải rác trên các nhóm Facebook, Zalo, Telegram "
        "hoặc lưu trữ trên Google Drive, Dropbox cá nhân không có tổ chức. "
        "Khi cần tìm lại, người dùng phải cuộn qua hàng trăm bài đăng hoặc hỏi lại thành viên.",
        bold_prefix="Nguồn tài liệu phân tán, không tập trung: "
    )
    add_bullet(
        " Các công cụ tìm kiếm trên mạng xã hội chỉ hỗ trợ so khớp từ khóa cơ bản (keyword matching), "
        "không hỗ trợ lọc theo định dạng file (PDF, DOCX, PPTX), không lọc theo mức giá, "
        "chủ đề hay đánh giá chất lượng. Kết quả thường lẫn quảng cáo, "
        "link chết hoặc tài liệu không đúng nội dung mong muốn.",
        bold_prefix="Tra cứu kém hiệu quả: "
    )
    add_bullet(
        " Không có cơ chế đánh giá sao, nhận xét, hoặc xem trước nội dung. "
        "Người dùng thường tải về mới phát hiện tài liệu bị lỗi font, thiếu trang, "
        "sai nội dung hoặc chất lượng kém.",
        bold_prefix="Thiếu kiểm chứng chất lượng: "
    )
    add_bullet(
        " Người có tài liệu chất lượng muốn bán nhưng không có kênh thanh toán an toàn, "
        "phải giao dịch thủ công qua chuyển khoản cá nhân, tiềm ẩn rủi ro lừa đảo "
        "và không có cơ chế hoàn tiền khi xảy ra tranh chấp.",
        bold_prefix="Giao dịch thiếu minh bạch: "
    )

    add_h2("2.2. Khảo sát các nền tảng hiện có trên thị trường")
    add_body("Nhóm đã khảo sát một số nền tảng chia sẻ tài liệu phổ biến hiện nay:")

    add_table(
        headers=["Nền tảng", "Ưu điểm", "Hạn chế"],
        data=[
            (
                "Tài liệu.vn\nStudocu",
                "• Kho tài liệu lớn, đa dạng\n• Hỗ trợ xem trước\n• Cộng đồng đông đảo",
                "• Không có hệ thống gợi ý AI\n• Không hỗ trợ giao dịch mua bán C2C\n• Không có ví nội bộ, coupon\n• Hỗ trợ khách hàng truyền thống"
            ),
            (
                "Google Scholar\nLibGen",
                "• Kho dữ liệu học thuật khổng lồ\n• Miễn phí truy cập",
                "• Không hỗ trợ thương mại hóa\n• Không có hệ thống đánh giá/review\n• Giao diện thô sơ, thiếu UX"
            ),
            (
                "Udemy\nCoursera",
                "• Nền tảng khóa học chuyên nghiệp\n• Hệ thống thanh toán hoàn chỉnh\n• Rating & Review đầy đủ",
                "• Tập trung khóa học video, không phải tài liệu rời\n• Chi phí cao, không phù hợp trao đổi tài liệu đơn lẻ\n• Không có AI gợi ý cá nhân hóa"
            ),
            (
                "Nhóm Facebook\nZalo Group",
                "• Miễn phí, dễ tiếp cận\n• Cộng đồng sẵn có",
                "• Hoàn toàn không có quản lý chất lượng\n• Không tìm kiếm nâng cao\n• Giao dịch thủ công, rủi ro cao\n• Không lưu trữ có tổ chức"
            ),
        ],
        col_widths=[Inches(1.3), Inches(2.3), Inches(3.1)]
    )

    add_h2("2.3. Khoảng trống (Gap) mà dự án LearnVault hướng tới giải quyết")
    add_body("Qua khảo sát, nhóm nhận thấy chưa có nền tảng nào tại Việt Nam đáp ứng đồng thời các yếu tố:")
    add_bullet(
        " Sàn thương mại chuyên biệt cho tài liệu học tập dạng file (PDF, DOCX, PPTX) "
        "với ví nội bộ và quy trình thanh toán an toàn.",
        bold_prefix="(1) "
    )
    add_bullet(
        " Hệ thống gợi ý cá nhân hóa (Recommendation Engine) ứng dụng AI phân tích hành vi người dùng.",
        bold_prefix="(2) "
    )
    add_bullet(
        " Hỗ trợ khách hàng tự động hóa với AI phân loại ticket khiếu nại và gợi ý phản hồi.",
        bold_prefix="(3) "
    )
    add_bullet(
        " Chatbot AI trợ lý học tập tích hợp trực tiếp trên nền tảng.",
        bold_prefix="(4) "
    )
    add_bullet(
        " Hệ thống đánh giá hai chiều (Buyer review + Seller reply) kết hợp kiểm duyệt Admin.",
        bold_prefix="(5) "
    )

    # ═══════════════════════════════════════════════════════════════
    # PHẦN 3: ĐẶC TẢ BÀI TOÁN
    # ═══════════════════════════════════════════════════════════════
    add_h1("3. ĐẶC TẢ BÀI TOÁN")

    add_h2("3.1. Mục tiêu tổng quát")
    add_body(
        "Xây dựng nền tảng sàn giao dịch học liệu trực tuyến LearnVault — một hệ thống website "
        "thương mại điện tử chuyên biệt cho việc tra cứu, chia sẻ, mua bán tài liệu học tập số. "
        "Nền tảng tích hợp công nghệ trí tuệ nhân tạo (Google Gemini AI) để gợi ý học liệu cá nhân hóa, "
        "tự động hóa hỗ trợ khách hàng và cung cấp chatbot trợ lý học tập."
    )

    add_h2("3.2. Đối tượng sử dụng & Phân quyền hệ thống")
    add_body("Hệ thống phân 3 vai trò chính (Role: User, Admin) với các quyền hạn cụ thể:")

    add_h3("a) Người mua / Người học (Buyer / Learner) — Role: User")
    add_bullet(" Đăng ký, đăng nhập tài khoản với xác thực JWT (JSON Web Token).", bold_prefix="Xác thực:")
    add_bullet(" Tìm kiếm tài liệu theo từ khóa (title, description), lọc theo tags, khoảng giá (minPrice, maxPrice).", bold_prefix="Tra cứu:")
    add_bullet(" Xem chi tiết tài liệu: mô tả, thumbnail xem trước, định dạng file, giá, thông tin người bán.", bold_prefix="Xem trước:")
    add_bullet(" Nạp tiền vào ví nội bộ (Wallet), thanh toán bằng ví hệ thống (SystemWalletPayment), áp dụng mã giảm giá Coupon.", bold_prefix="Mua & thanh toán:")
    add_bullet(" Đánh giá sao (1-5), viết nhận xét cho tài liệu đã mua (chỉ cho phép đánh giá 1 lần/tài liệu).", bold_prefix="Đánh giá:")
    add_bullet(" Gửi ticket khiếu nại khi gặp vấn đề (lỗi file, thanh toán, tài khoản).", bold_prefix="Hỗ trợ:")
    add_bullet(" Nhận gợi ý tài liệu cá nhân hóa từ AI dựa trên lịch sử tương tác.", bold_prefix="AI gợi ý:")
    add_bullet(" Trò chuyện với EduBot (Chatbot AI) để được tư vấn học tập.", bold_prefix="Chatbot:")

    add_h3("b) Người bán / Người chia sẻ (Seller / Provider) — Role: User")
    add_bullet(" Đăng tải tài liệu với file đính kèm (upload lên Cloudinary) và ảnh thumbnail.", bold_prefix="Đăng tài liệu:")
    add_bullet(" Chỉnh sửa, xóa tài liệu của mình; theo dõi trạng thái kiểm duyệt (Pending → Approved / Rejected).", bold_prefix="Quản lý tài liệu:")
    add_bullet(" Xem Dashboard seller: biểu đồ doanh thu theo ngày, tổng lượt bán, tổng thu nhập.", bold_prefix="Thống kê doanh thu:")
    add_bullet(" Tạo mã giảm giá (Coupon) với phần trăm chiết khấu, giới hạn lượt dùng, ngày hết hạn.", bold_prefix="Marketing:")
    add_bullet(" Đọc và phản hồi lại nhận xét của khách hàng (Seller Reply).", bold_prefix="Phản hồi đánh giá:")
    add_bullet(" Nhận doanh thu trực tiếp vào ví khi giao dịch thành công; rút tiền từ ví.", bold_prefix="Thu nhập:")

    add_h3("c) Quản trị viên (Admin)")
    add_bullet(" Dashboard tổng quan: thống kê tổng người dùng, tổng học liệu, tổng giao dịch, tổng doanh thu, top 5 học liệu bán chạy, hoạt động 7 ngày gần nhất.", bold_prefix="Thống kê hệ thống:")
    add_bullet(" Phê duyệt (Approved) hoặc từ chối (Rejected) tài liệu mới đăng; lọc theo trạng thái Pending/Approved/Rejected.", bold_prefix="Kiểm duyệt học liệu:")
    add_bullet(" Xem danh sách, tìm kiếm, khóa/mở khóa tài khoản; xem hồ sơ 360° (lịch sử mua, bán, tương tác, ví, ticket).", bold_prefix="Quản lý người dùng:")
    add_bullet(" Giám sát giao dịch toàn hệ thống; thực hiện hoàn tiền (Refund) cho giao dịch tranh chấp.", bold_prefix="Quản lý giao dịch:")
    add_bullet(" Xem ticket khiếu nại, đọc kết quả phân loại và gợi ý trả lời từ AI, phản hồi người dùng.", bold_prefix="Hỗ trợ khách hàng:")
    add_bullet(" Gửi thông báo hệ thống hàng loạt (Broadcast) đến nhóm người dùng: All, Active, Inactive.", bold_prefix="Gửi thông báo:")

    add_h2("3.3. Bảng phân rã chức năng hệ thống (Functional Decomposition)")

    add_table(
        headers=["Phân hệ (Module)", "Chức năng chính", "Mô tả chi tiết"],
        data=[
            (
                "Xác thực & Tài khoản\n(Auth & User)",
                "• Đăng ký / Đăng nhập\n• Quản lý hồ sơ\n• Phân quyền (User, Admin)",
                "- Xác thực bằng JWT + Bcrypt hash mật khẩu.\n- Xem/chỉnh sửa thông tin cá nhân.\n- Middleware phân quyền (auth, isAdmin)."
            ),
            (
                "Tra cứu & Quản lý\nHọc liệu\n(Materials)",
                "• Tìm kiếm đa tiêu chí\n• Upload file & thumbnail\n• Kiểm duyệt nội dung\n• CRUD tài liệu",
                "- Tìm theo keyword (title, description), tags, khoảng giá.\n- Upload file lên Cloudinary (PDF, DOCX, PPTX...).\n- Admin duyệt: Pending → Approved / Rejected.\n- Provider: tạo, sửa, xóa tài liệu."
            ),
            (
                "Ví điện tử &\nGiao dịch\n(Wallet & Transaction)",
                "• Ví nội bộ (Wallet)\n• Nạp/rút tiền\n• Thanh toán đơn hàng\n• Áp dụng mã giảm giá\n• Hoàn tiền (Refund)",
                "- Ví tự động tạo khi đăng ký; nạp/rút tiền mock.\n- Checkout: trừ tiền buyer, cộng tiền seller.\n- Strategy Pattern cho thanh toán (Wallet/Momo/VNPay).\n- Coupon: chiết khấu %, giới hạn lượt dùng.\n- Admin hoàn tiền nguyên tử (Prisma $transaction)."
            ),
            (
                "Đánh giá &\nPhản hồi\n(Material Review)",
                "• Chấm sao 1-5\n• Viết nhận xét\n• Phản hồi tác giả\n• Điểm trung bình",
                "- Chỉ cho phép đánh giá sau khi mua (kiểm tra Transaction).\n- Unique constraint: 1 user chỉ review 1 lần/tài liệu.\n- Seller Reply: tác giả phản hồi nhận xét.\n- Tính điểm trung bình tự động."
            ),
            (
                "Hỗ trợ khách hàng\n& AI Ticket\n(Support Ticket)",
                "• Gửi ticket khiếu nại\n• AI phân loại tự động\n• AI gợi ý trả lời\n• Hệ thống tin nhắn",
                "- User tạo ticket (subject, description).\n- Gemini AI tự động phân loại: Lỗi thanh toán, Kỹ thuật, Tài khoản, Góp ý, Khác.\n- AI đề xuất câu trả lời mẫu cho Admin.\n- Hệ thống TicketMessage để trao đổi."
            ),
            (
                "AI Gợi ý &\nChatbot\n(AI Recommendation\n& EduBot)",
                "• Gợi ý cá nhân hóa\n• Ghi nhận tương tác\n• Chatbot trợ lý",
                "- Thu thập hành vi: click, view, add_to_cart, purchase.\n- Gemini AI phân tích sở thích → đề xuất tối đa 4 tài liệu.\n- EduBot: chatbot hỗ trợ tư vấn học tập tích hợp."
            ),
            (
                "Quản trị hệ thống\n(Admin Dashboard)",
                "• Dashboard thống kê\n• Quản lý user\n• Quản lý giao dịch\n• Broadcast thông báo",
                "- Thống kê: users, materials, transactions, revenue, top5.\n- Hồ sơ 360° người dùng.\n- Lọc/phân trang/tìm kiếm toàn bộ dữ liệu.\n- Gửi thông báo hàng loạt theo phân khúc."
            ),
        ],
        col_widths=[Inches(1.5), Inches(2.0), Inches(3.2)]
    )

    add_h2("3.4. Yêu cầu phi chức năng (Non-Functional Requirements)")
    add_bullet(" Tốc độ tìm kiếm và trả kết quả dưới 1 giây; thao tác xem trước tài liệu mượt mà.", bold_prefix="Hiệu năng tra cứu: ")
    add_bullet(" Mật khẩu được mã hóa bằng Bcrypt; xác thực bằng JWT; file lưu trữ trên Cloudinary (đám mây); các giao dịch tài chính sử dụng Prisma $transaction đảm bảo tính ACID.", bold_prefix="Bảo mật & Toàn vẹn dữ liệu: ")
    add_bullet(" Giao diện Responsive hoàn hảo trên mọi thiết bị (Desktop, Laptop, Tablet, Mobile) sử dụng Tailwind CSS.", bold_prefix="Tính khả dụng: ")
    add_bullet(" Kiến trúc tách biệt Backend (Express API) và Frontend (Next.js) cho phép mở rộng độc lập.", bold_prefix="Khả năng mở rộng: ")

    add_h2("3.5. Tiêu chí thành công của dự án (Success Criteria)")
    add_bullet(" Hệ thống tra cứu hoạt động ổn định, phản hồi truy vấn dưới 1 giây.", bold_prefix="1. Tra cứu hiệu quả: ")
    add_bullet(" 100% học liệu trên sàn được Admin kiểm duyệt trước khi công khai.", bold_prefix="2. Kiểm soát chất lượng: ")
    add_bullet(" Giao dịch trừ/cộng ví, coupon, hoàn tiền hoạt động chính xác tuyệt đối, không sai lệch số dư.", bold_prefix="3. An toàn giao dịch: ")
    add_bullet(" AI phân loại ticket đạt độ chính xác trên 85%; gợi ý tài liệu phản ánh đúng sở thích người dùng.", bold_prefix="4. Hiệu quả AI: ")
    add_bullet(" Quy trình từ tìm kiếm đến tải tài liệu không quá 3 bước thao tác.", bold_prefix="5. Trải nghiệm người dùng: ")

    # ═══════════════════════════════════════════════════════════════
    # PHẦN 4: XÁC ĐỊNH GIẢI PHÁP AI
    # ═══════════════════════════════════════════════════════════════
    add_h1("4. XÁC ĐỊNH GIẢI PHÁP AI")

    add_h2("4.1. Tổng quan chiến lược ứng dụng AI trong LearnVault")
    add_body(
        "LearnVault tích hợp Google Gemini AI (model gemini-1.5-flash) vào 3 điểm tiếp xúc chính "
        "trên nền tảng, tạo thành bộ ba giải pháp AI toàn diện: "
        "(1) Hệ thống gợi ý cá nhân hóa, (2) Hỗ trợ khách hàng thông minh, "
        "và (3) Chatbot trợ lý học tập."
    )

    add_h2("4.2. Giải pháp AI #1: Hệ thống gợi ý học liệu cá nhân hóa (AI Recommendation Engine)")

    add_h3("Bài toán:")
    add_body(
        "Người dùng thường không biết chính xác mình cần tài liệu gì, "
        "hoặc bỏ sót nhiều tài liệu chất lượng trong kho hàng trăm/ngàn sản phẩm. "
        "Cần một hệ thống có khả năng \"hiểu\" sở thích cá nhân và tự động đề xuất nội dung phù hợp."
    )

    add_h3("Giải pháp triển khai:")
    add_bullet(
        " Hệ thống ghi nhận mọi hành vi tương tác của người dùng với tài liệu thông qua "
        "bảng UserInteraction, bao gồm 4 loại sự kiện: click (nhấp vào xem), view (xem chi tiết), "
        "add_to_cart (thêm vào giỏ hàng), purchase (mua thành công). "
        "Mỗi sự kiện được gắn với user_id, material_id và timestamp.",
        bold_prefix="Bước 1 — Thu thập dữ liệu hành vi: "
    )
    add_bullet(
        " Khi người dùng yêu cầu gợi ý, hệ thống lấy 20 tương tác gần nhất cùng "
        "danh sách tối đa 50 tài liệu khả dụng trên sàn. Dữ liệu này được cấu trúc thành prompt "
        "gửi đến Gemini AI để phân tích.",
        bold_prefix="Bước 2 — Xây dựng ngữ cảnh (Context Building): "
    )
    add_bullet(
        " Gemini AI đóng vai \"chuyên gia tư vấn học liệu\", phân tích mối tương quan giữa "
        "tags, title, loại tương tác (mua có trọng số cao hơn xem) để chọn ra tối đa 4 tài liệu phù hợp nhất. "
        "Kết quả trả về dưới dạng JSON array chứa ID tài liệu (responseMimeType: application/json).",
        bold_prefix="Bước 3 — AI phân tích và đề xuất: "
    )
    add_bullet(
        " Hệ thống query database lấy thông tin đầy đủ (title, price, thumbnail, provider) "
        "của các tài liệu được AI chọn và hiển thị trên giao diện thành section \"AI Gợi ý cho bạn\". "
        "Nếu AI gặp lỗi, hệ thống tự động fallback sang gợi ý 4 tài liệu mới nhất.",
        bold_prefix="Bước 4 — Hiển thị kết quả với Fallback: "
    )

    add_h3("Prompt mẫu:")
    add_body(
        "\"Bạn là một AI phân tích hành vi và đề xuất tài liệu học tập cho sinh viên. "
        "Dựa vào lịch sử tương tác (nếu có), hãy chọn ra tối đa 4 học liệu phù hợp nhất "
        "từ danh sách hiện có. Trả về MỘT MẢNG JSON hợp lệ chứa các chuỗi ID.\""
    )

    add_h2("4.3. Giải pháp AI #2: Hỗ trợ khách hàng thông minh (AI Ticket Classification & Reply Suggestion)")

    add_h3("Bài toán:")
    add_body(
        "Khi lượng người dùng tăng, số lượng ticket khiếu nại sẽ tăng theo. "
        "Admin phải đọc và phân loại từng ticket thủ công trước khi phản hồi, "
        "gây chậm trễ và không đồng nhất trong chất lượng hỗ trợ."
    )

    add_h3("Giải pháp triển khai:")
    add_bullet(
        " Ngay khi người dùng submit ticket (subject + description), "
        "hệ thống tự động gửi nội dung ticket đến Gemini AI trước khi lưu vào database.",
        bold_prefix="Bước 1 — Kích hoạt AI tại thời điểm tạo ticket: "
    )
    add_bullet(
        " AI phân loại nội dung ticket vào 1 trong 5 danh mục: "
        "\"Lỗi thanh toán\", \"Kỹ thuật\", \"Tài khoản\", \"Góp ý\", \"Khác\". "
        "Kết quả phân loại được lưu vào trường category của ticket.",
        bold_prefix="Bước 2 — Phân loại tự động (Auto-Classification): "
    )
    add_bullet(
        " Đồng thời, AI tạo ra một câu trả lời mẫu lịch sự, ngắn gọn (dưới 50 từ) "
        "phù hợp với nội dung khiếu nại. Gợi ý được lưu vào trường ai_suggested_reply "
        "để Admin tham khảo và chỉnh sửa nếu cần.",
        bold_prefix="Bước 3 — Gợi ý câu trả lời (AI Suggested Reply): "
    )
    add_bullet(
        " Admin xem ticket đã được phân loại sẵn, đọc gợi ý AI, "
        "quyết định sử dụng hoặc chỉnh sửa trước khi gửi phản hồi qua hệ thống TicketMessage. "
        "Nếu AI gặp lỗi, ticket vẫn được tạo bình thường với category mặc định là \"Khác\".",
        bold_prefix="Bước 4 — Admin ra quyết định cuối cùng: "
    )

    add_h3("Prompt mẫu:")
    add_body(
        "\"Bạn là Hệ thống hỗ trợ khách hàng tự động. Phân loại khiếu nại vào một danh mục "
        "(Lỗi thanh toán, Kỹ thuật, Tài khoản, Góp ý, Khác) và gợi ý câu trả lời mẫu lịch sự dưới 50 chữ. "
        "Trả về JSON: {category, suggested_reply}.\""
    )

    add_h2("4.4. Giải pháp AI #3: Chatbot trợ lý học tập (EduBot)")

    add_h3("Bài toán:")
    add_body(
        "Người dùng thường có các câu hỏi nhanh về cách sử dụng nền tảng, "
        "tìm kiếm tài liệu theo chủ đề, hoặc cần tư vấn định hướng học tập. "
        "Cần một kênh hỗ trợ phản hồi tức thì 24/7."
    )

    add_h3("Giải pháp triển khai:")
    add_bullet(
        " Chatbot EduBot được tích hợp dưới dạng floating widget ở góc phải dưới màn hình, "
        "hiển thị trên mọi trang của website.",
        bold_prefix="Giao diện: "
    )
    add_bullet(
        " Gemini AI đóng vai trợ lý \"EduBot\" với system prompt cố định, "
        "có khả năng: trả lời thân thiện về học tập, hướng dẫn sử dụng nền tảng, "
        "tư vấn ngành học và gợi ý cách tìm tài liệu.",
        bold_prefix="AI Engine: "
    )
    add_bullet(
        " Hỗ trợ đa lượt hội thoại (multi-turn) trong phiên làm việc; "
        "phản hồi bằng văn bản thuần (không markdown phức tạp) để tối ưu trải nghiệm đọc trên chat.",
        bold_prefix="Trải nghiệm: "
    )

    add_h2("4.5. Kiến trúc kỹ thuật tổng thể")

    add_table(
        headers=["Thành phần", "Công nghệ", "Vai trò"],
        data=[
            ("Backend API", "Node.js, Express, TypeScript", "Xử lý logic nghiệp vụ, RESTful API"),
            ("Frontend", "Next.js (App Router), TypeScript", "Giao diện người dùng (SSR/CSR)"),
            ("Database", "MySQL + Prisma ORM", "Lưu trữ dữ liệu quan hệ"),
            ("AI Engine", "Google Gemini 1.5 Flash\n(@google/genai SDK)", "Gợi ý cá nhân hóa, phân loại ticket,\nchatbot trợ lý"),
            ("File Storage", "Cloudinary (Cloud)", "Lưu trữ file tài liệu & thumbnail"),
            ("Authentication", "JWT + Bcrypt", "Xác thực & mã hóa mật khẩu"),
            ("State Management", "Zustand", "Quản lý trạng thái phía client"),
            ("UI Framework", "Tailwind CSS + Lucide Icons", "Thiết kế giao diện responsive"),
            ("Design Pattern", "Strategy Pattern (Payment)", "Mở rộng phương thức thanh toán"),
        ],
        col_widths=[Inches(1.5), Inches(2.2), Inches(3.0)]
    )

    add_h2("4.6. Tổng kết giá trị AI mang lại cho LearnVault")

    add_table(
        headers=["Điểm tích hợp AI", "Đầu vào (Input)", "Đầu ra (Output)", "Giá trị kinh doanh"],
        data=[
            (
                "Gợi ý cá nhân hóa\n(Recommendation)",
                "20 tương tác gần nhất\n+ Danh sách 50 tài liệu",
                "JSON array: tối đa 4 ID\ntài liệu được đề xuất",
                "Tăng tỷ lệ chuyển đổi mua;\ngiảm thời gian tìm kiếm"
            ),
            (
                "Phân loại Ticket\n(Classification)",
                "Subject + Description\ncủa ticket khiếu nại",
                "JSON: {category,\nsuggested_reply}",
                "Giảm 70% thời gian phân\nloại thủ công cho Admin"
            ),
            (
                "Chatbot EduBot\n(Conversational AI)",
                "Câu hỏi tự do\ncủa người dùng",
                "Câu trả lời văn bản\nthân thiện, ngắn gọn",
                "Hỗ trợ 24/7; giảm tải\ncho đội ngũ support"
            ),
        ],
        col_widths=[Inches(1.4), Inches(1.7), Inches(1.7), Inches(1.9)]
    )

    # Save file
    output_path = r"d:\DOANTTTN\Bao_Cao_Dac_Ta_De_Tai_Tra_Cuu_Hoc_Lieu.docx"
    doc.save(output_path)
    print(f"SUCCESS: Saved file to {output_path}")

if __name__ == '__main__':
    create_document()
