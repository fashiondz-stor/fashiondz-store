
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

    img.alt = product.name_ar || 'منتج من Fashion DZ'
    img.loading = 'lazy'

    const name = document.createElement('h3')
    name.textContent = product.name_ar || 'منتج بدون اسم'

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
// زر دخول المدير
const adminButton = document.createElement('button')
adminButton.textContent = 'دخول المدير'
adminButton.style.cssText = `
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 999;
  background: #FF6500;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
`
document.body.appendChild(adminButton)

// نافذة تسجيل الدخول
const adminPanel = document.createElement('div')
adminPanel.style.cssText = `
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.8);
  justify-content: center;
  align-items: center;
  padding: 20px;
`

adminPanel.innerHTML = `
  <div style="background:#292929;color:#F8F5ED;padding:25px;border-radius:12px;width:100%;max-width:350px;">
    <h2>دخول المدير</h2>
    <form id="admin-login-form">
      <input id="admin-email" type="email" placeholder="البريد الإلكتروني" required
        style="display:block;width:100%;padding:12px;margin:12px 0;box-sizing:border-box;">
      <input id="admin-password" type="password" placeholder="كلمة المرور" required
        style="display:block;width:100%;padding:12px;margin:12px 0;box-sizing:border-box;">
      <button type="submit" style="background:#FF6500;color:white;padding:12px;width:100%;border:0;border-radius:6px;">
        تسجيل الدخول
      </button>
    </form>
    <p id="admin-message"></p>
    <button id="admin-close" style="padding:10px;">إغلاق</button>
  </div>
`

document.body.appendChild(adminPanel)

adminButton.addEventListener('click', () => {
  adminPanel.style.display = 'flex'
})

document.querySelector('#admin-close').addEventListener('click', () => {
  adminPanel.style.display = 'none'
})

// التحقق من حساب المدير
document.querySelector('#admin-login-form').addEventListener('submit', async (event) => {
  event.preventDefault()

  const message = document.querySelector('#admin-message')
  const email = document.querySelector('#admin-email').value
  const password = document.querySelector('#admin-password').value

  message.textContent = 'جارٍ التحقق...'

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    message.textContent = 'تعذر تسجيل الدخول. تحقق من البيانات.'
    return
  }

  const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin')

  if (roleError || isAdmin !== true) {
    await supabase.auth.signOut()
    message.textContent = 'هذا الحساب لا يملك صلاحية المدير.'
    return
  }

  message.textContent = 'تم تسجيل الدخول بنجاح! أنت المدير.'
})
