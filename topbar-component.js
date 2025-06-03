class TopBar extends HTMLElement {
  constructor() {
    super();
    
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --primary-color: #1a2a6c;
          --secondary-color: #3a7bd5;
          --accent-color: #00d2ff;
          --topbar-height: 70px;
        }
        
        .topbar {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 50%, var(--accent-color) 100%);
          color: white;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: var(--topbar-height);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo-img {
          height: 35px;
          width: auto;
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        
        .logo-img:hover {
          transform: scale(1.05);
        }
        
        .topbar-icon {
          font-size: 22px;
          cursor: pointer;
          padding: 10px;
          border-radius: 50%;
          transition: all 0.2s ease;
          color: white;
        }
        
        .topbar-icon:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }
        
        .topbar-icon:active {
          transform: scale(0.95);
        }
        
        @media (max-width: 768px) {
          :host {
            --topbar-height: 60px;
          }
          
          .topbar {
            padding: 0 15px;
          }
          
          .logo-img {
            height: 30px;
          }
          
          .topbar-icon {
            font-size: 20px;
            padding: 8px;
          }
        }
      </style>
      <header class="topbar">
        <div class="logo-section">
          <i class="fas fa-bars topbar-icon" id="menuBtn"></i>
          <img src="https://github.com/qmsweb/Tools/raw/main/images/rawafid/r-logo.png" 
               alt="شعار روافد" 
               class="logo-img"
               id="logoBtn">
        </div>
        
        <div>
          <i class="fas fa-search topbar-icon" id="searchBtn"></i>
        </div>
      </header>
    `;
  }

  connectedCallback() {
    this.shadowRoot.getElementById('menuBtn').addEventListener('click', this.handleMenuClick);
    this.shadowRoot.getElementById('searchBtn').addEventListener('click', this.handleSearchClick);
    this.shadowRoot.getElementById('logoBtn').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  handleMenuClick = () => {
    // يمكنك إضافة فتح القائمة الجانبية هنا
    console.log('فتح القائمة الجانبية');
  }

  handleSearchClick = () => {
    // يمكنك إضافة فتح شريط البحث هنا
    console.log('فتح شريط البحث');
  }
}

customElements.define('top-bar', TopBar);
