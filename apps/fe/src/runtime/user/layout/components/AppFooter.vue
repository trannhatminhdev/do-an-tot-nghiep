<template>
  <footer
    class="bg-white w-full border-t border-gray-100 mt-20 pt-16 pb-20 md:pb-0"
  >
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-4 md:px-10 pb-16 max-w-[1280px] mx-auto"
    >
      <!-- Brand & Description -->
      <div class="flex flex-col">
        <NuxtLink to="/" class="inline-flex items-center mb-4">
          <span
            class="text-2xl font-black text-[#0052cc] bg-clip-text bg-gradient-to-r from-[#0052cc] to-[#0ea5e9]"
          >
            TechPulse<span class="text-[#0ea5e9]">.</span>
          </span>
        </NuxtLink>
        <p class="text-gray-500 mb-6 leading-relaxed text-sm">
          Chuyên cung cấp linh kiện điện tử, board Arduino, vi điều khiển, cảm
          biến, động cơ và thiết bị DIY/IoT chính hãng, chất lượng cao cho cộng
          đồng Maker và kỹ sư công nghệ.
        </p>
        <!-- <div class="space-y-2 text-xs text-gray-600">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#0052cc] text-base">call</span>
            <span>Hotline tư vấn: <strong>1900 6868</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#0052cc] text-base">mail</span>
            <span>Hỗ trợ kỹ thuật: <strong>support@techpulse.vn</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#0052cc] text-base">location_on</span>
            <span>Địa chỉ: TP. Hồ Chí Minh &amp; Hà Nội</span>
          </div>
        </div> -->
      </div>

      <!-- Danh mục sản phẩm -->
      <div>
        <h4
          class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider"
        >
          Danh Mục Linh Kiện
        </h4>
        <ul class="space-y-2.5 text-sm text-gray-600">
          <li>
            <NuxtLink
              to="/products"
              class="hover:text-[#0052cc] transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-xs text-gray-400"
                >chevron_right</span
              >
              Arduino &amp; Vi Điều Khiển
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/products"
              class="hover:text-[#0052cc] transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-xs text-gray-400"
                >chevron_right</span
              >
              Cảm Biến Điện Tử
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/products"
              class="hover:text-[#0052cc] transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-xs text-gray-400"
                >chevron_right</span
              >
              Động Cơ &amp; Robot
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/products"
              class="hover:text-[#0052cc] transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-xs text-gray-400"
                >chevron_right</span
              >
              Module &amp; Nguồn Điện
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Hỗ trợ kỹ thuật & Khách hàng -->
      <div>
        <h4
          class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider"
        >
          Hỗ Trợ Khách Hàng
        </h4>
        <ul class="space-y-2.5 text-sm text-gray-600">
          <li>
            <NuxtLink
              to="/orders"
              class="hover:text-[#0052cc] transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-xs text-gray-400"
                >chevron_right</span
              >
              Tra cứu đơn hàng
            </NuxtLink>
          </li>
          <!-- <li>
            <span class="hover:text-[#0052cc] transition-colors flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-xs text-gray-400">chevron_right</span>
              Chính sách bảo hành &amp; đổi trả
            </span>
          </li>
          <li>
            <span class="hover:text-[#0052cc] transition-colors flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-xs text-gray-400">chevron_right</span>
              Tài liệu kỹ thuật &amp; Sơ đồ chân
            </span>
          </li>
          <li>
            <span class="hover:text-[#0052cc] transition-colors flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-xs text-gray-400">chevron_right</span>
              Phương thức thanh toán &amp; Vận chuyển
            </span>
          </li> -->
        </ul>
      </div>

      <!-- Cam kết & Thanh toán -->
      <div>
        <h4
          class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider"
        >
          Cam Kết Chất Lượng
        </h4>
        <div class="space-y-3 text-xs text-gray-600">
          <div
            class="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100"
          >
            <span class="material-symbols-outlined text-[#0052cc] text-lg"
              >verified</span
            >
            <div>
              <strong class="text-gray-800 block">100% Linh kiện chuẩn</strong>
              <span>Kiểm định chất lượng trước khi xuất kho</span>
            </div>
          </div>
          <div
            class="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100"
          >
            <span class="material-symbols-outlined text-[#0ea5e9] text-lg"
              >local_shipping</span
            >
            <div>
              <strong class="text-gray-800 block">Giao hàng toàn quốc</strong>
              <span>Đóng gói chống sốc an toàn cho linh kiện</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Copyright Row -->
    <div class="border-t border-gray-100 bg-gray-50/70">
      <div
        class="max-w-[1280px] mx-auto px-4 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p class="text-xs text-gray-500 text-center md:text-left">
          © 2026 TechPulse Electronics - Cửa hàng Linh kiện Điện tử &amp; Tự
          động hoá. Tất cả quyền được bảo lưu.
        </p>
        <div
          class="flex items-center gap-4 text-xs font-semibold text-gray-500"
        >
          <span>COD</span>
        </div>
      </div>
    </div>
  </footer>
</template>
