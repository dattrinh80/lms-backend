# 0) Bối cảnh & Mục tiêu sản phẩm
- Sản phẩm SaaS cho **trung tâm tiếng Anh/đào tạo ngắn hạn**. Mỗi trung tâm mua tài khoản (tenant) và tự vận hành trên cùng một nền tảng.
- Mục tiêu 12–18 tháng: đạt PMF cho 100–300 trung tâm quy mô nhỏ/vừa; sẵn sàng tách dịch vụ khi tăng trưởng.

---
# 1) Đối tượng sử dụng & Giá trị cốt lõi
**Vai trò:** Quản trị/ Ban giám hiệu (Admin), Giáo viên, Phụ huynh/Học viên (PHHS), Kế toán/Tài chính.
**Giá trị:**
- Quản trị: cấu hình chương trình học, thời khóa biểu, người dùng, báo cáo điều hành.
- Giáo viên: giao/nộp/chấm bài, điểm danh, điểm số, lịch dạy, tương tác lớp.
- PHHS: theo dõi bài tập, điểm, lịch học, thông báo, học phí, xin nghỉ.
- Tài chính: cấu hình phí, chính sách học phí/ưu đãi, sinh khoản, thu/hoàn phí, báo cáo.

---
# 2) Phạm vi chức năng (rút gọn theo MVP → mở rộng)
## 2.1 MVP (3–4 tháng)
1. **Quản trị & Danh mục**: tổ chức → cơ sở → lớp/khóa học → ca học → phòng học; môn học; học viên; giáo viên; phân quyền.
2. **Lịch & Điểm danh**: thời khóa biểu; điểm danh theo buổi/tiết; xin nghỉ & phê duyệt.
3. **Bài tập & Điểm số**: giao bài, nộp bài (file/ảnh/văn bản), chấm điểm, nhận xét, bảng điểm theo lớp/học viên.
4. **Học phí cơ bản**: kỳ thu (theo tháng/kỳ/năm), sinh khoản phí theo lớp/khóa; ghi nhận thanh toán (tiền mặt/chuyển khoản/QR); trạng thái nợ.
5. **Cổng PHHS** (web/app responsive): xem bài tập/điểm/lịch/điểm danh; thanh toán/biên lai; thông báo.
6. **Báo cáo cơ bản**: hiện trạng lớp, chuyên cần, học phí đã thu/còn nợ, top nợ.

## 2.2 Phase 2 (3–4 tháng kế tiếp)
- **Chính sách học phí nâng cao**: theo khối/nhóm lớp/năm học; nhiều chính sách ưu đãi (học bổng/anh chị em/hoàn cảnh); hoàn phí.
- **Tự động hoá tài chính**: lịch sinh khoản định kỳ, điều chỉnh khi chuyển lớp/nghỉ học; đối soát.
- **Tương tác mạng xã hội nội bộ**: bài đăng lớp/trường, bình luận; thông báo đẩy.
- **AI trợ giảng**: gợi ý đề bài/trắc nghiệm/nhận xét chấm bài; thống kê học viên yếu để can thiệp sớm.

## 2.3 Phase 3 (6–9 tháng)
- **E‑commerce dịch vụ**: bán giáo trình/khóa bổ trợ, mã giảm giá.
- **Marketplace nội dung**: thư viện học liệu, template đề thi.
- **Phân tích nâng cao**: dự báo kết quả, tối ưu lịch dạy; báo cáo điều hành đa chiều.
- **Tách microservices có chọn lọc**: Billing/Payments, Notifications, Content.

---
# 3) Kiến trúc kỹ thuật
## 3.1 Định hướng tổng thể
- **Monolithic modular** theo **Hexagonal/DDD** để dễ tách dịch vụ.
- Lớp hoá: **Domain** ↔ **Application (use cases/CQRS‑lite)** ↔ **Ports** ↔ **Adapters** (HTTP, DB, Message, Files, Payments).
- Mỗi **Bounded Context (module)** độc lập: `Users`, `Org & Classes`, `Scheduling`, `Attendance`, `Assignments`, `Grading`, `Finance`, `Comms`, `Reporting`, `AI`.

## 3.2 Multi‑tenancy (SaaS)
- Giai đoạn 1: **Single DB + discriminator `tenant_id`** ở mọi bảng; **guard** ở tầng Repository + middleware; index theo `(tenant_id, ...)`.
- Khi mở rộng: tách **per‑tenant schema** (PostgreSQL) hoặc **database per tenant** cho khách lớn; đồng bộ bằng event bus.

## 3.3 Stack đề xuất
- **Backend**: NestJS (TypeScript). Layered modules + CQRS‑lite; class‑validator/zod; Swagger; Jest.
- **ORM**: Prisma (ưu tiên dev speed) hoặc TypeORM (nếu cần decorator/entity truyền thống). DB: **MySQL 8** (ưu tiên hiện tại), sẵn phương án PostgreSQL.
- **Cache/Queue**: Redis (cache/session/rate limit); RabbitMQ hoặc BullMQ (job/queue) cho nền tảng thông báo, outbox.
- **AuthN/Z**: JWT (multi‑tenant claims) + RBAC; có thể tích hợp **Keycloak**/Auth0 ở giai đoạn nâng cao (SSO, OIDC, SCIM). MFA cho admin.
- **Frontend**: NextJS (App Router), React Query/TanStack Query; Tailwind + shadcn/ui. SSR/ISR cho cổng PHHS; SPA cho backoffice.
- **Files**: S3‑compatible (e.g., MinIO) cho bài nộp, tài liệu.
- **Observability**: OpenTelemetry + Prometheus/Grafana + ELK/EFK; req tracing theo tenant.
- **CI/CD**: GitHub Actions; Docker; K8s (giai đoạn mở rộng), trước mắt docker‑compose.
- **Payments**: cổng VN (VNPAY/MoMo/Zalopay) + QR Napas; chuẩn bị PCI‑aware (token hoá, không giữ PAN).

## 3.4 Sơ đồ lớp kiến trúc (mô tả)
- **Inbound Adapters**: REST(HTTP)/GraphQL, Webhook, Cron.
- **Application**: Command/Query handlers; Saga cho nghiệp vụ dài (ví dụ hoàn phí nhiều bước).
- **Domain**: Entities/Aggregates (`Student`, `Class`, `Enrollment`, `Invoice`, `Payment`, `Assignment`, `Submission`, `Grade`, `AttendanceRecord`), Domain events.
- **Outbound Adapters**: Repos (DB), Message bus, Payment gateway, File storage, Email/SMS/Push.

## 3.5 Giao thức & bảo mật
- Strict **tenant isolation** qua middleware + policy ở Repo; kiểm thử xâm nhập multi‑tenant.
- Rate‑limit tuyến public; IP allowlist cho webhook thanh toán; ký HMAC.
- DLP cơ bản cho tệp nộp bài; mã hoá at‑rest (S3 SSE) & in‑transit (TLS).

---
# 4) Thiết kế domain (rút gọn)
## 4.1 Users & Org
- `Organization(tenant)`, `Branch`, `Room`, `Program`, `Course(Class)`, `Teacher`, `Student`, `Enrollment`.
- Quan hệ: `Student`—`Enrollment`—`Course`; `Teacher`—`Course`(role).

## 4.2 Scheduling & Attendance
- `Timetable`, `Session` (buổi/tiết), `AttendanceRecord`, `LeaveRequest`.
- Luồng: tạo timetable → phát sinh `Session` → điểm danh → tổng hợp chuyên cần.

## 4.3 Assignments & Grading
- `Assignment` (meta, deadline), `Submission` (file/ảnh/text), `Rubric` (tuỳ chọn), `Grade` (thang điểm), `Feedback`.

## 4.4 Finance (Billing)
- `FeePolicy` (khối/lớp/năm), `Discount` (học bổng/anh chị em), `Invoice` (kỳ/hóa đơn), `InvoiceLine`, `Payment`, `Refund`, `Receipt`.
- Luồng: cấu hình chính sách → sinh khoản theo kỳ → phát hành `Invoice` → nhận `Payment` → cập nhật trạng thái/biên lai → hoàn/refund.

---
# 5) API & Tích hợp
- REST (Admin/Teacher/Finance) + public API cho web/app PHHS.
- Webhook thanh toán; SMTP/SMS/Push; SSO OAuth2 (tùy chọn).
- Export Excel/PDF; import CSV (học viên/lớp/thời khóa biểu).

---
# 6) Chiến lược dữ liệu & báo cáo
- Khoá ngoại chặt chẽ + cascade hợp lý; soft‑delete với `deleted_at`.
- Kho báo cáo nhẹ: bảng tổng hợp theo ngày/tháng cho chuyên cần, điểm, thu phí (materialized views/job ban đêm).

---
# 7) Chất lượng & Vận hành
- **Testing**: unit (domain), integration (repo/adapters), e2e (API) per module; test dữ liệu đa tenant.
- **Feature flags** theo tenant; migration an toàn (db‑migrate/Prisma migrate).
- **SLA**: 99.5% giai đoạn đầu; RTO 4h/RPO 24h; backup hàng ngày; warm‑standby sau khi scale.

---
# 8) Lộ trình triển khai
## Sprint 0 (2 tuần): Nền tảng
- Repo mono, scaffold NestJS/NextJS; auth & tenant middleware; ORM, DB schema core; CI/CD; thiết kế UI system.

## Phase MVP (3–4 tháng)
- **P1 (tuần 1–4)**: Users/Org, lớp/khóa, lịch & session, PHHS portal skeleton.
- **P2 (tuần 5–8)**: Assignments/Submissions/Grading; điểm danh & xin nghỉ; báo cáo cơ bản.
- **P3 (tuần 9–12)**: Finance cơ bản (chính sách phí cơ bản, sinh khoản, thu phí, biên lai); thanh toán QR; xuất Excel/PDF.
- **Beta (tuần 13–16)**: hardening, bảo mật, quan trắc, UAT 5–10 trung tâm; sửa lỗi & tối ưu performance.

## Phase 2 (3–4 tháng)
- Finance nâng cao (ưu đãi, hoàn phí, điều chỉnh theo thay đổi lớp); bài đăng/tương tác; thông báo đẩy; AI trợ giảng.

## Phase 3 (6–9 tháng)
- Phân tích nâng cao; marketplace nội dung; xem xét tách microservices (Billing/Payments, Notifications, Reporting) khi QPS và team tăng.

---
# 9) Chuẩn UI/UX & Frontend
- Backoffice (Admin/Teacher/Finance): App Shell + Sidebar nav; search/filter; bảng dữ liệu ảo hoá; upload lớn (resumable).
- Cổng PHHS: mobile‑first; thẻ tổng quan (bài chưa nộp, điểm, lịch hôm nay, công nợ); dark mode; i18n (vi/en).

---
# 10) Kế hoạch bảo mật & tuân thủ
- Chính sách mật khẩu + MFA admin; nhật ký audit theo tenant & user.
- Quy trình xử lý dữ liệu cá nhân (xoá/ẩn danh theo yêu cầu); mã hoá S3; nhật ký truy cập tài liệu.
- Pentest định kỳ; dependency scanning; SBOM.

---
# 11) Tiêu chí sẵn sàng tách microservices
- Module có **ràng buộc lỏng** (qua events/queues), sở hữu DB riêng dễ bóc tách.
- **Động cơ tách**: team chuyên trách, tải cao (Finance/Payments, Notifications), yêu cầu mở rộng độc lập, thay đổi nhịp độ khác.
- **Checklist**: API hợp đồng rõ; outbox & idempotency; quan trắc/alert riêng; runbook; migration chiến lược dữ liệu.

---
# 12) Backlog kỹ thuật chi tiết (MVP)
1. **Auth & Tenant**: login/password + refresh token; middleware gán `tenantId`; seed super‑admin.
2. **Users/Org**: CRUD Teacher/Student; import CSV; phân quyền (RBAC roles: ADMIN, TEACHER, FINANCE, PARENT/STUDENT).
3. **Classes & Timetable**: CRUD lớp/khóa, môn; tạo timetable; phát sinh `Session` theo tuần.
4. **Attendance**: điểm danh; xin nghỉ → phê duyệt; báo cáo chuyên cần.
5. **Assignments**: CRUD assignment; upload; nộp bài; chấm điểm + nhận xét; bảng điểm.
6. **Finance**: thiết lập kỳ thu & phí cơ bản; sinh khoản; ghi nhận thanh toán; biên lai PDF; báo cáo đã thu/còn nợ.
7. **PHHS Portal**: dashboard; bài tập/điểm/lịch/điểm danh; học phí & thanh toán.
8. **Infra/Ops**: logging/metrics/tracing; backup; CI/CD; test e2e.

---
# 13) Định nghĩa xong (DoD) cho MVP
- 95% hành trình người dùng chính chạy trơn: tạo trung tâm → tạo lớp/môn → nhập GV/HS → lập lịch → giao/nộp/chấm bài → điểm danh → sinh khoản → thu phí.
- Tỷ lệ lỗi < 0.1% request; thời gian phản hồi P95 < 500ms cho list 50 bản ghi.
- Tài liệu vận hành (runbook), hướng dẫn admin & giáo viên, video quickstart.

---
# 14) Rủi ro & Biện pháp
- **Đa tenant rò rỉ dữ liệu** → test tự động, policy repo, chaos test cross‑tenant.
- **Variations chính sách học phí** → domain `FeePolicy`/`Discount` linh hoạt, rule engine nhẹ.
- **Hiệu năng báo cáo** → bảng tổng hợp/ETL nhẹ, phân trang thực dụng, cache.
- **Upload lớn/ảnh bài nộp** → pre‑signed URL, nén ảnh phía client.

---
# 15) Mẫu schema (rút gọn – tham khảo)
```
Tenant(id, name,...)
User(id, tenant_id, role, ...)
Student(id, tenant_id, ...)
Teacher(id, tenant_id, ...)
Course(id, tenant_id, subject, level, ...)
Enrollment(id, tenant_id, student_id, course_id, ...)
Session(id, tenant_id, course_id, starts_at, ...)
AttendanceRecord(id, tenant_id, session_id, student_id, status,...)
Assignment(id, tenant_id, course_id, title, deadline,...)
Submission(id, tenant_id, assignment_id, student_id, type, url/text,...)
Grade(id, tenant_id, submission_id, score, rubric,...)
FeePolicy(id, tenant_id, scope, rules,...)
Invoice(id, tenant_id, student_id, period, status, total, ...)
InvoiceLine(id, invoice_id, item, qty, amount,...)
Payment(id, tenant_id, invoice_id, amount, method, tx_ref,...)
Refund(id, tenant_id, payment_id, amount, reason,...)
```

---
# 16) Kết luận
Lộ trình theo **MVP → mở rộng** cùng kiến trúc **monolith‑module‑hexagonal** đảm bảo phát triển nhanh, dễ bảo trì và sẵn sàng tách microservices khi đạt quy mô. Tập trung vào trải nghiệm giáo viên & PHHS, và module Tài chính linh hoạt sẽ tạo lợi thế cạnh tranh ở thị trường trung tâm đào tạo.

