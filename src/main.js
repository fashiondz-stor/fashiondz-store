
import { createClient } from '@supabase/supabase-js'
import './style.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

document.querySelector('#app').innerHTML = `
  <header>
    <h1>FASHION DZ</h1>
    <p>YOUR STYLE, YOUR CHOICE</p>
  </header>

  <nav class="main-nav">
    <a href="#home" data-category="all">الرئيسية</a>
    <a href="#clothing" data-category="clothing">ملابس الرجال</a>
    <a href="#shoes" data-category="shoes">الأحذية</a>
    <a href="#accessories" data-category="accessories">الإكسسوارات</a>
  </nav>

  <section class="hero" id="home">
    <h2>اكتشف أناقتك</h2>
    <p>مرحباً بك في Fashion DZ، وجهتك لاكتشاف أحدث أزياء الرجال.</p>
  </section>

  <main id="products-section">
    <h2 id="section-title">جميع المنتجات</h2>
    <div id="products">جاري تحميل المنتجات...</div>
  </main>

  <footer>FASHION DZ © 2026</footer>
`

let allProducts = []

const container = document.querySelector('#products')
const sectionTitle = document.querySelector('#section-title')

const categoryNames = {
  all: 'جميع المنتجات',
  clothing: 'ملابس الرجال',
  shoes: 'الأحذية',
  accessories: 'الإكسسوارات'
}

function displayProducts(category = 'all') {
  sectionTitle.textContent = categoryNames[category]

  container.replaceChildren()

  const filteredProducts = category === 'all'
    ? allProducts
    : allProducts.filter(product => product.category === category)

  if (filteredProducts.length === 0) {
    container.textContent = 'لا توجد منتجات في هذا القسم حالياً.'
    return
  }

  filteredProducts.forEach(product => {
    const card = document.createElement('article')
    card.className = 'product'

    const img = document.createElement('img')
    const imageUrl = product.image_url

    if (typeof imageUrl === 'string' &&
        /^https?:\/\//i.test(imageUrl)) {
      img.src = imageUrl
    }

    img.alt = product.name || 'منتج من Fashion DZ'
    img.loading = 'lazy'

    const name = document.createElement('h3')
    name.textContent = product.name || 'منتج بدون اسم'

    const price = document.createElement('p')
    price.textContent = `${product.price ?? 'غير محدد'} دج`

    card.append(img, name, price)
    container.appendChild(card)
  })
}

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault()

    const category = link.dataset.category

    displayProducts(category)

    document.querySelectorAll('.main-nav a').forEach(item => {
      item.style.background = ''
    })

    link.style.background = '#FF6500'

    document.querySelector('#products-section').scrollIntoView({
      behavior: 'smooth'
    })
  })
})

async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    container.textContent = 'تعذر تحميل المنتجات حالياً.'
    console.error(error)
    return
  }

  allProducts = data || []
  displayProducts('all')
}

loadProducts()
