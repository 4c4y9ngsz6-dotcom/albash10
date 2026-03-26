let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check if cart exists in localStorage
    const savedCart = localStorage.getItem('albash_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }

    // Bind Add to Cart buttons (supports both product-card and slider-card)
    const addBtns = document.querySelectorAll('.product-card .btn-primary, .slider-card .btn-primary');
    addBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.product-card, .slider-card');

            
            // Get product details
            let title = '';
            const enTitleEl = card.querySelector('.en-title');
            if (enTitleEl) {
                title = enTitleEl.innerText;
            } else {
                title = card.querySelector('h3').innerText;
            }
            
            const priceText = card.querySelector('.price').innerText.replace(/,/g, '');
            const price = parseInt(priceText) || 0;
            const imgEl = card.querySelector('img');
            let imgSrc = 'images/logo.png';
            if (imgEl) {
                // Store relative path only (strip file:/// prefix if present)
                const rawSrc = imgEl.getAttribute('src');
                if (rawSrc) {
                    imgSrc = rawSrc;
                }
            }

            addToCart(title, price, imgSrc);
        });
    });

    // Bind Cart icon click
    const cartIcon = document.querySelector('.cart-icon');
    if(cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }
});

function addToCart(title, price, imgSrc) {
    const existingItem = cart.find(item => item.title === title);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ title, price, imgSrc, qty: 1 });
    }
    
    saveCart();
    updateCartCount();
    
    // Show success modal
    document.getElementById('addedProductName').innerText = title;
    openModal('successModal');
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => b.innerText = count);
}

function saveCart() {
    localStorage.setItem('albash_cart', JSON.stringify(cart));
}

function openCart() {
    closeModal('successModal');
    renderCartItems();
    openModal('cartModal');
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const countEl = document.getElementById('cartCountDisplay');
    
    container.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">السلة فارغة حالياً</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            count += item.qty;
            
            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.imgSrc}" alt="${item.title}">
                    <div class="cart-item-details">
            <div class="cart-item-title" dir="auto" style="text-align: right;">${item.title}</div>

                        <div style="color: var(--primary-dark); font-weight: 700;">${item.price.toLocaleString()} د.ع</div>
                    </div>
                    <div class="qty-controls" dir="ltr">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span style="font-weight: bold; width: 20px; text-align: center;">${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                    <button class="item-remove" onclick="removeItem(${index})" title="حذف المنتَج"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            container.innerHTML += itemHTML;
        });
    }

    if(countEl) countEl.innerText = `الكمية: ${count} منتجات`;
    if(totalEl) totalEl.innerText = total.toLocaleString();
}

function changeQty(index, delta) {
    if (cart[index].qty + delta > 0) {
        cart[index].qty += delta;
    } else {
        cart.splice(index, 1);
    }
    saveCart();
    renderCartItems();
    updateCartCount();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartItems();
    updateCartCount();
}

function openModal(id) {
    const modal = document.getElementById(id);
    if(!modal) return;
    modal.classList.add('show'); // Pure CSS transition
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if(!modal) return;
    modal.classList.remove('show');
}

function completePurchase() {
    if (cart.length === 0) {
        alert('السلة فارغة! يرجى إضافة منتجات إلى السلة أولاً.');
        return;
    }

    const nameEl = document.getElementById('customerName');
    const phoneEl = document.getElementById('customerPhone');
    const cityEl = document.getElementById('customerCity');
    const addressEl = document.getElementById('customerAddress');

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const city = cityEl.value;
    const address = addressEl.value.trim();
    const notes = document.getElementById('customerNotes').value.trim();

    // Reset errors
    [nameEl, phoneEl, cityEl, addressEl].forEach(el => el.classList.remove('error-input'));

    let hasError = false;
    if (!name) { nameEl.classList.add('error-input'); hasError = true; }
    if (!phone) { phoneEl.classList.add('error-input'); hasError = true; }
    if (!city) { cityEl.classList.add('error-input'); hasError = true; }
    if (!address) { addressEl.classList.add('error-input'); hasError = true; }

    if (hasError) {
        alert('يرجى تعبئة جميع الحقول المطلوبة (باللون الأحمر).');
        return;
    }

    let message = `🍯 *طلب جديد من متجر عسل الباش* 🍯\n`;
    message += `-------------------------------\n`;
    message += `👤 *الاسم:* ${name}\n`;
    message += `📱 *الهاتف:* ${phone}\n`;
    message += `📍 *المحافظة:* ${city}\n`;
    message += `🏡 *نقطة دالة/العنوان:* ${address}\n`;
    if (notes) {
        message += `📝 *ملاحظات:* ${notes}\n`;
    }
    
    message += `-------------------------------\n`;
    message += `*تفاصيل الطلب:*\n`;
    
    let total = 0;
    cart.forEach(item => {
        message += `🔸 ${item.qty}x ${item.title} (${item.price.toLocaleString()} د.ع)\n`;
        total += item.price * item.qty;
    });
    
    message += `-------------------------------\n`;
    message += `💰 *الإجمالي الكلي:* ${total.toLocaleString()} د.ع\n`;

    const whatsappNumber = "9647811162189";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
}
