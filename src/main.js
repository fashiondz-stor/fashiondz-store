import { createClient } from '@supabase/supabase-js'
import './style.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
)

document.querySelector('#app').innerHTML = `
  <header>
    <h1>FASHION DZ</h1>
    <p>YOUR STYLE, YOUR CHOICE</p>
  </header>
<nav class="main-nav">
  <a href="#home">الرئيسية</a>
  <a href="#clothing">ملابس الرجال</a>
  <a href="#shoes">الأحذية</a>
  <a href="#accessories">الإكسسوارات</a>
</nav>
  <section class="hero">
    <h2>اكتشف أناقتك</h2>
    <p>مرحباً بك في Fashion DZ، وجهتك لاكتشاف أحدث الأزياء.</p>
  </section>

  <main>
    <h2>منتجاتنا</h2>
    <div id="products">جاري تحميل المنتجات...</div>
  </main>

  <footer>FASHION DZ © 2026</footer>
`

async function loadProducts() {
  const container = document.querySelector('#products')

  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    container.textContent = 'تعذر تحميل المنتجات حالياً.'
    console.error(error)
    return
  }

  if (!data || data.length === 0) {
    container.textContent = 'لا توجد منتجات حالياً.'
    return
  }

  container.innerHTML = data.map(product => `
    <article class="product">
      <img src="${product.image_url || ''}" alt="">
      <h3>${product.name}</h3>
      <p>${product.price} دج</p>
    </article>
  `).join('')
}

loadProducts()
