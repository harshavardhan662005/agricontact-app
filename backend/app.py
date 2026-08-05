import hashlib
import io
import os
import urllib.parse
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import requests
import streamlit as st

# Optional PostgreSQL import handling
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

# ==========================================
# 1. PAGE CONFIGURATION
# ==========================================
st.set_page_config(
    page_title="Agricontact Portal",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# 2. ENHANCED CSS THEME & STYLING
# ==========================================
st.markdown("""
<style>
    /* Main Background Gradient */
    .stApp {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%);
        color: #0f291e;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Sidebar Custom Styling */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #064e3b 0%, #047857 60%, #065f46 100%) !important;
        border-right: 1px solid #059669;
    }
    
    [data-testid="stSidebar"] * {
        color: #f0fdf4 !important;
    }

    /* Custom Glassmorphism Cards */
    .agri-card {
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid #a7f3d0;
        box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
        margin-bottom: 1.25rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .agri-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.15);
    }

    /* Gradient Header Banners */
    .hero-header {
        background: linear-gradient(120deg, #059669 0%, #10b981 50%, #047857 100%);
        color: white !important;
        padding: 1.5rem 2rem;
        border-radius: 18px;
        box-shadow: 0 10px 20px -5px rgba(5, 150, 105, 0.3);
        margin-bottom: 1.5rem;
    }
    .hero-header h1, .hero-header h2, .hero-header h3, .hero-header p {
        color: white !important;
        margin: 0;
    }

    /* Custom Buttons */
    .stButton > button {
        background: linear-gradient(90deg, #059669 0%, #10b981 100%);
        color: #ffffff !important;
        border-radius: 10px;
        border: none;
        font-weight: 600;
        padding: 0.5rem 1rem;
        box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);
        transition: all 0.2s ease;
    }
    .stButton > button:hover {
        background: linear-gradient(90deg, #047857 0%, #059669 100%);
        box-shadow: 0 6px 12px -2px rgba(5, 150, 105, 0.35);
        transform: translateY(-1px);
    }

    /* WhatsApp Button Custom Styling */
    .wa-button {
        display: inline-block;
        background-color: #25D366;
        color: white !important;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: bold;
        text-decoration: none;
        box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);
        transition: background 0.3s ease;
    }
    .wa-button:hover {
        background-color: #1da851;
    }

    /* Category Badges */
    .badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .badge-green { background-color: #dcfce7; color: #166534; }
    .badge-amber { background-color: #fef3c7; color: #92400e; }
    .badge-blue { background-color: #dbeafe; color: #1e40af; }
    .badge-purple { background-color: #f3e8ff; color: #6b21a8; }

    /* Input Fields Styling */
    .stTextInput input, .stSelectbox div[data-baseweb="select"], .stTextArea textarea {
        border-radius: 10px !important;
        border: 1px solid #6ee7b7 !important;
    }
    
    [data-testid="stMetricValue"] {
        color: #047857 !important;
        font-weight: 700 !important;
    }
</style>
""", unsafe_allow_html=True)

# ==========================================
# 3. DATABASE & SESSION STATE INITIALIZATION
# ==========================================
def get_db_url():
    return st.secrets.get("DATABASE_URL", os.environ.get("DATABASE_URL"))

def get_db_connection():
    db_url = get_db_url()
    if HAS_PSYCOPG2 and db_url:
        return psycopg2.connect(db_url, cursor_factory=RealDictCursor)
    return None

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn = get_db_connection()
    if conn:
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS users (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            email VARCHAR(255) UNIQUE NOT NULL,
                            password_hash VARCHAR(255) NOT NULL,
                            language VARCHAR(10) DEFAULT 'en',
                            is_admin INT DEFAULT 0
                        );
                    """)
                    cursor.execute("SELECT id FROM users WHERE email = %s;", ("admin@example.com",))
                    if not cursor.fetchone():
                        cursor.execute(
                            "INSERT INTO users (name, email, password_hash, language, is_admin) VALUES (%s, %s, %s, %s, %s);",
                            ("System Admin", "admin@example.com", hash_password("admin123"), "en", 1)
                        )
        except Exception as e:
            st.error(f"Database Initialization Notice: {e}")

def authenticate_user(email, password):
    conn = get_db_connection()
    if conn:
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT * FROM users WHERE email = %s;", (email,))
                    user = cursor.fetchone()
                    if user and user["password_hash"] == hash_password(password):
                        return dict(user)
        except Exception:
            pass
    # Fallback default login for local testing
    if email == "admin@example.com" and password == "admin123":
        return {"id": 1, "name": "System Admin", "email": "admin@example.com", "language": "en", "is_admin": 1}
    elif email == "alex@example.com" and password == "password123":
        return {"id": 2, "name": "Alex Farmer", "email": "alex@example.com", "language": "en", "is_admin": 0}
    return None

def register_user(name, email, password, lang="en", is_admin=0):
    conn = get_db_connection()
    if conn:
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "INSERT INTO users (name, email, password_hash, language, is_admin) VALUES (%s, %s, %s, %s, %s);",
                        (name, email, hash_password(password), lang, is_admin)
                    )
                    return True, "Success"
        except Exception as e:
            return False, str(e)
    return True, "Registered locally"

def get_all_users():
    conn = get_db_connection()
    if conn:
        return pd.read_sql_query("SELECT id, name, email, language, is_admin FROM users ORDER BY id ASC;", conn)
    return pd.DataFrame([
        {"id": 1, "name": "System Admin", "email": "admin@example.com", "language": "en", "is_admin": 1},
        {"id": 2, "name": "Alex Farmer", "email": "alex@example.com", "language": "en", "is_admin": 0}
    ])

init_db()

# --- Initialize Default Contracts in Session State ---
if "contracts" not in st.session_state:
    st.session_state["contracts"] = pd.DataFrame([
        {
            "Contract ID": "CTR-1001",
            "Buyer/Corporate": "AgriCorp India Ltd",
            "Crop": "Wheat (Kanak)",
            "Agreed Price (₹/Qtl)": 2350,
            "Quantity (Qtl)": 500,
            "Delivery Date": "2026-09-15",
            "Status": "Active",
            "Payment Terms": "50% Advance, 50% Delivery"
        },
        {
            "Contract ID": "CTR-1002",
            "Buyer/Corporate": "GreenField Food Processing",
            "Crop": "Rice (Basmati)",
            "Agreed Price (₹/Qtl)": 4300,
            "Quantity (Qtl)": 300,
            "Delivery Date": "2026-10-01",
            "Status": "Pending Approval",
            "Payment Terms": "100% On Delivery"
        }
    ])

# ==========================================
# 4. EXTERNAL APIS & TRANSLATIONS
# ==========================================
@st.cache_data(ttl=3600)
def search_global_cities(query, lang_code):
    if not query or len(query.strip()) < 2:
        return []
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language={lang_code}&format=json"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            return res.json().get("results", [])
    except Exception:
        pass
    return []

@st.cache_data(ttl=600)
def fetch_weather(lat, lon):
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,rain_sum&timezone=auto"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            return res.json()
    except Exception:
        pass
    return None

TRANSLATIONS = {
    "en": {
        "title": "🌿 Agricontact Portal",
        "subtitle": "Smart Agricultural Management & Contract Hub",
        "nav_dashboard": "🌤️ Weather & Advisory",
        "nav_market": "🌾 Mandi Market Rates",
        "nav_my_contracts": "📜 My Contracts",
        "nav_new_contract": "✍️ New Contract Settings",
        "nav_whatsapp": "💬 WhatsApp Communication",
        "nav_crop_health": "🌱 Crop Health & Soil",
        "nav_pest": "🐛 Pest Diagnostics",
        "nav_schemes": "🏛️ Govt Schemes",
        "nav_profile": "👤 My Profile",
        "nav_settings": "⚙️ System Settings",
        "nav_admin": "👑 Admin Panel",
        "logout": "🚪 Log Out"
    },
    "hi": {
        "title": "🌿 एग्रीकॉन्टैक्ट पोर्टल",
        "subtitle": "स्मार्ट कृषि प्रबंधन एवं अनुबंध केंद्र",
        "nav_dashboard": "🌤️ मौसम और सलाह",
        "nav_market": "🌾 मंडी बाजार भाव",
        "nav_my_contracts": "📜 मेरे अनुबंध (Contracts)",
        "nav_new_contract": "✍️ नया अनुबंध सेटिंग्स",
        "nav_whatsapp": "💬 व्हाट्सएप संचार",
        "nav_crop_health": "🌱 फसल स्वास्थ्य और मिट्टी",
        "nav_pest": "🐛 कीट गाइड",
        "nav_schemes": "🏛️ सरकारी योजनाएं",
        "nav_profile": "👤 मेरी प्रोफाइल",
        "nav_settings": "⚙️ सिस्टम सेटिंग्स",
        "nav_admin": "👑 एडमिन पैनल",
        "logout": "🚪 लॉग आउट"
    },
    "te": {
        "title": "🌿 అగ్రికాంటాక్ట్ పోర్టల్",
        "subtitle": "స్మార్ట్ వ్యవసాయ నిర్వహణ మరియు కాంట్రాక్ట్ హబ్",
        "nav_dashboard": "🌤️ వాతావరణం & సలహాలు",
        "nav_market": "🌾 మండి మార్కెట్ ధరలు",
        "nav_my_contracts": "📜 నా ఒప్పందాలు (Contracts)",
        "nav_new_contract": "✍️ కొత్త ఒప్పంద సెట్టింగ్‌లు",
        "nav_whatsapp": "💬 వాట్సాప్ కమ్యూనికేషన్",
        "nav_crop_health": "🌱 పంట ఆరోగ్యం & నేల",
        "nav_pest": "🐛 పురుగుల మార్గదర్శి",
        "nav_schemes": "🏛️ ప్రభుత్వ పథకాలు",
        "nav_profile": "👤 నా ప్రొఫైల్",
        "nav_settings": "⚙️ సిస్టమ్ సెట్టింగ్‌లు",
        "nav_admin": "👑 అడ్మిన్ ప్యానెల్",
        "logout": "లాగ్ అవుట్"
    }
}

LANGUAGE_OPTIONS = {"English": "en", "हिंदी (Hindi)": "hi", "తెలుగు (Telugu)": "te"}

if "user" not in st.session_state:
    st.session_state["user"] = None
if "lang" not in st.session_state:
    st.session_state["lang"] = "en"

def get_txt(key):
    lang = st.session_state.get("lang", "en")
    return TRANSLATIONS.get(lang, TRANSLATIONS["en"]).get(key, key)

def convert_df_to_csv(df):
    return df.to_csv(index=False).encode('utf-8')

def convert_df_to_excel(df):
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False)
    return output.getvalue()

# ==========================================
# 5. USER AUTHENTICATION & ROUTING
# ==========================================
if st.session_state["user"] is None:
    col1, col2, col3 = st.columns([1, 1.8, 1])
    with col2:
        st.markdown(f"""
        <div class="hero-header" style="text-align: center;">
            <h1>{get_txt('title')}</h1>
            <p>{get_txt('subtitle')}</p>
        </div>
        """, unsafe_allow_html=True)

        lang_choice = st.selectbox("🌐 Select Language / भाषा / భాష", list(LANGUAGE_OPTIONS.keys()))
        st.session_state["lang"] = LANGUAGE_OPTIONS[lang_choice]

        tab_login, tab_signup = st.tabs(["🔑 Sign In", "📝 Register"])

        with tab_login:
            with st.form("login_form"):
                email = st.text_input("Email Address", value="admin@example.com")
                password = st.text_input("Password", type="password", value="admin123")
                if st.form_submit_button("Sign In to Portal", use_container_width=True):
                    user = authenticate_user(email, password)
                    if user:
                        st.session_state["user"] = user
                        st.session_state["lang"] = user.get("language", "en")
                        st.success("Welcome back!")
                        st.rerun()
                    else:
                        st.error("Invalid email or password.")

        with tab_signup:
            with st.form("signup_form"):
                name = st.text_input("Full Name")
                email = st.text_input("Email Address")
                password = st.text_input("Password", type="password")
                if st.form_submit_button("Create Account", use_container_width=True):
                    if name and email and password:
                        ok, msg = register_user(name, email, password, st.session_state["lang"])
                        if ok:
                            st.success("Account created successfully! Please log in.")
                        else:
                            st.error(f"Failed: {msg}")

else:
    user = st.session_state["user"]

    # --- SIDEBAR NAVIGATION ---
    with st.sidebar:
        st.markdown("""
        <div style="text-align: center; padding: 10px 0;">
            <h2 style="margin: 0; color: #ffffff;">🌿 AGRICONTACT</h2>
            <p style="font-size: 0.85rem; opacity: 0.85; margin-top: 2px;">Smart Farming & Contracting</p>
        </div>
        <hr style="border-color: #059669; margin: 10px 0;"/>
        """, unsafe_allow_html=True)

        role_label = "👑 Administrator" if user.get("is_admin") == 1 else "🧑‍🌾 Verified Farmer"
        st.markdown(f"""
        <div style="background: rgba(255,255,255,0.12); padding: 12px; border-radius: 12px; margin-bottom: 15px;">
            <strong style="font-size: 1.05rem;">{user['name']}</strong><br/>
            <span class="badge badge-green">{role_label}</span><br/>
            <small style="opacity: 0.85;">{user['email']}</small>
        </div>
        """, unsafe_allow_html=True)

        # Language Selection Dropdown
        st.markdown("🌐 **Language Settings**")
        selected_lang_name = st.selectbox(
            "Interface Language",
            list(LANGUAGE_OPTIONS.keys()),
            index=list(LANGUAGE_OPTIONS.values()).index(st.session_state["lang"]),
            label_visibility="collapsed"
        )
        new_code = LANGUAGE_OPTIONS[selected_lang_name]
        if new_code != st.session_state["lang"]:
            st.session_state["lang"] = new_code
            st.rerun()

        st.markdown("<hr style='border-color: #059669; margin: 10px 0;'/>", unsafe_allow_html=True)

        # Full Sidebar Navigation Items
        nav_items = [
            get_txt("nav_dashboard"),
            get_txt("nav_market"),
            get_txt("nav_my_contracts"),
            get_txt("nav_new_contract"),
            get_txt("nav_whatsapp"),
            get_txt("nav_crop_health"),
            get_txt("nav_pest"),
            get_txt("nav_schemes"),
            get_txt("nav_profile"),
            get_txt("nav_settings")
        ]
        if user.get("is_admin") == 1:
            nav_items.append(get_txt("nav_admin"))

        selected_nav = st.radio("NAVIGATION MENU", nav_items, label_visibility="visible")

        st.markdown("<hr style='border-color: #059669;'/>", unsafe_allow_html=True)

        if st.button(get_txt("logout"), use_container_width=True):
            st.session_state["user"] = None
            st.rerun()

    # ==========================================
    # 6. MAIN CONTENT MODULES
    # ==========================================

    # 1. WEATHER & ADVISORY
    if selected_nav == get_txt("nav_dashboard"):
        st.markdown(f"""
        <div class="hero-header">
            <h2>{get_txt('nav_dashboard')}</h2>
            <p>Real-time climate tracking, 7-day temperature trends & map location</p>
        </div>
        """, unsafe_allow_html=True)

        col_q, col_s = st.columns([2, 2])
        with col_q:
            city_query = st.text_input("🔍 Search Location / City", value="Delhi")
        
        results = search_global_cities(city_query, st.session_state["lang"])
        lat, lon, location_name = 28.6139, 77.2090, "New Delhi, India"

        if results:
            options = {f"{c['name']}, {c.get('admin1','')}, {c.get('country','')}" : (c['latitude'], c['longitude']) for c in results}
            with col_s:
                chosen_city = st.selectbox("📍 Select Precise City", list(options.keys()))
                lat, lon = options[chosen_city]
                location_name = chosen_city

        weather_data = fetch_weather(lat, lon)
        if weather_data:
            curr = weather_data.get("current", {})
            daily = weather_data.get("daily", {})
            temp = curr.get("temperature_2m", 0)
            rain = daily.get("rain_sum", [0])[0]

            m1, m2, m3, m4 = st.columns(4)
            m1.metric("Temperature", f"{round(temp)}°C", f"Max {round(daily.get('temperature_2m_max', [0])[0])}°C")
            m2.metric("Humidity", f"{curr.get('relative_humidity_2m', 0)}%")
            m3.metric("Wind Speed", f"{curr.get('wind_speed_10m', 0)} km/h")
            m4.metric("Rainfall Forecast", f"{rain} mm")

            st.markdown("### 📈 7-Day Temperature & Rainfall Forecast")
            forecast_df = pd.DataFrame({
                "Date": daily.get("time", []),
                "Max Temp (°C)": daily.get("temperature_2m_max", []),
                "Min Temp (°C)": daily.get("temperature_2m_min", []),
                "Rainfall (mm)": daily.get("rain_sum", [])
            })

            fig_weather = go.Figure()
            fig_weather.add_trace(go.Scatter(x=forecast_df['Date'], y=forecast_df['Max Temp (°C)'], mode='lines+markers', name='Max Temp (°C)', line=dict(color='#ef4444', width=3)))
            fig_weather.add_trace(go.Scatter(x=forecast_df['Date'], y=forecast_df['Min Temp (°C)'], mode='lines+markers', name='Min Temp (°C)', line=dict(color='#3b82f6', width=3)))
            fig_weather.add_trace(go.Bar(x=forecast_df['Date'], y=forecast_df['Rainfall (mm)'], name='Rainfall (mm)', opacity=0.4, marker_color='#10b981', yaxis='y2'))

            fig_weather.update_layout(
                paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(255,255,255,0.7)',
                margin=dict(l=20, r=20, t=30, b=20),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
                yaxis=dict(title="Temperature (°C)"),
                yaxis2=dict(title="Rainfall (mm)", overlaying='y', side='right', showgrid=False)
            )
            st.plotly_chart(fig_weather, use_container_width=True)

            col_map, col_adv = st.columns([1.5, 2])
            with col_map:
                st.markdown("### 📍 Location Map")
                st.map(pd.DataFrame({'lat': [lat], 'lon': [lon]}), zoom=9)
            with col_adv:
                st.markdown("### 🌾 Action Plan")
                st.markdown(f"""
                <div class="agri-card">
                    <span class="badge badge-green">Thermal Status</span>
                    <h4 style="margin-top: 8px;">Optimal Growing Conditions</h4>
                    <p>Current temp ({temp}°C) supports healthy vegetative growth.</p>
                </div>
                <div class="agri-card">
                    <span class="badge badge-blue">Irrigation Plan</span>
                    <h4 style="margin-top: 8px;">Irrigation Advisory</h4>
                    <p>Expected rain: <b>{rain} mm</b>. Adjust drip irrigation to prevent waterlogging.</p>
                </div>
                """, unsafe_allow_html=True)

    # 2. MANDI MARKET PRICES
    elif selected_nav == get_txt("nav_market"):
        st.markdown("""
        <div class="hero-header">
            <h2>🌾 Mandi Market Commodity Prices</h2>
            <p>Live commodity rates, price comparison charts, and regional Mandi maps</p>
        </div>
        """, unsafe_allow_html=True)

        market_data = pd.DataFrame({
            "Commodity": ["Wheat (Kanak)", "Rice (Basmati)", "Cotton", "Soybean", "Maize", "Potato", "Tomato"],
            "Category": ["Cereals", "Cereals", "Fiber", "Oilseeds", "Cereals", "Vegetables", "Vegetables"],
            "Market Rate (₹/Qtl)": [2275, 4150, 7100, 4650, 2090, 1450, 2200],
            "Daily Trend": ["▲ +1.2%", "▲ +0.5%", "▼ -0.8%", "▲ +2.1%", "► 0.0%", "▲ +3.4%", "▼ -2.5%"],
            "Mandi Location": ["Khanna, Punjab", "Karnal, Haryana", "Rajkot, Gujarat", "Indore, MP", "Guntur, AP", "Agra, UP", "Nashik, MH"],
            "lat": [30.7018, 29.6857, 22.3039, 22.7196, 16.3067, 27.1767, 19.9975],
            "lon": [76.2183, 76.9905, 70.8022, 75.8577, 80.4365, 78.0081, 73.7898]
        })

        selected_category = st.selectbox("Filter Category", ["All Categories"] + list(market_data["Category"].unique()))
        filtered_df = market_data if selected_category == "All Categories" else market_data[market_data["Category"] == selected_category]

        st.markdown("### 📊 Mandi Price Comparison")
        fig_market = px.bar(filtered_df, x="Commodity", y="Market Rate (₹/Qtl)", color="Category", text="Market Rate (₹/Qtl)", title="Current Market Rates per Quintal (₹)")
        fig_market.update_traces(texttemplate='₹%{text}', textposition='outside')
        fig_market.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(255,255,255,0.7)', yaxis=dict(range=[0, filtered_df['Market Rate (₹/Qtl)'].max() * 1.15]))
        st.plotly_chart(fig_market, use_container_width=True)

        col_tbl, col_mandi_map = st.columns([2, 1])
        with col_tbl:
            display_cols = ["Commodity", "Category", "Market Rate (₹/Qtl)", "Daily Trend", "Mandi Location"]
            st.dataframe(filtered_df[display_cols], use_container_width=True, hide_index=True)
        with col_mandi_map:
            st.map(filtered_df[["lat", "lon"]], zoom=4)

    # 3. MY CONTRACTS
    elif selected_nav == get_txt("nav_my_contracts"):
        st.markdown("""
        <div class="hero-header">
            <h2>📜 My Active & Pending Contracts</h2>
            <p>Track legally binding farming agreements, corporate buyers, and delivery schedules</p>
        </div>
        """, unsafe_allow_html=True)

        contracts_df = st.session_state["contracts"]

        # Summary Metrics
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Total Contracts", len(contracts_df))
        c2.metric("Active Contracts", len(contracts_df[contracts_df["Status"] == "Active"]))
        c3.metric("Total Quantity", f"{contracts_df['Quantity (Qtl)'].sum()} Qtl")
        c4.metric("Est. Total Value", f"₹{(contracts_df['Agreed Price (₹/Qtl)'] * contracts_df['Quantity (Qtl)']).sum():,}")

        st.markdown("### 📋 Contract Records")
        st.dataframe(contracts_df, use_container_width=True, hide_index=True)

        st.markdown("### 📑 Detailed Contract Views")
        for idx, row in contracts_df.iterrows():
            badge_class = "badge-green" if row["Status"] == "Active" else "badge-amber"
            st.markdown(f"""
            <div class="agri-card">
                <span class="badge {badge_class}">{row['Status']}</span>
                <h3 style="margin: 8px 0; color: #065f46;">{row['Contract ID']}: {row['Crop']}</h3>
                <p><b>🏢 Buyer/Corporate:</b> {row['Buyer/Corporate']} | <b>📦 Quantity:</b> {row['Quantity (Qtl)']} Qtl</p>
                <p><b>💰 Agreed Price:</b> ₹{row['Agreed Price (₹/Qtl)']}/Qtl | <b>📅 Delivery Due:</b> {row['Delivery Date']}</p>
                <p><b>💳 Payment Terms:</b> {row['Payment Terms']}</p>
            </div>
            """, unsafe_allow_html=True)

    # 4. NEW CONTRACT SETTINGS
    elif selected_nav == get_txt("nav_new_contract"):
        st.markdown("""
        <div class="hero-header">
            <h2>✍️ New Contract Settings & Draft Form</h2>
            <p>Define contract parameters, lock prices with buyers, and set quality standards</p>
        </div>
        """, unsafe_allow_html=True)

        with st.form("create_contract_form"):
            st.markdown("### 📄 Step 1: Corporate Buyer & Commodity Details")
            col_f1, col_f2 = st.columns(2)
            with col_f1:
                buyer_name = st.text_input("Buyer / Corporate Entity Name", value="ITC Agri Business")
                crop_name = st.selectbox("Select Crop / Commodity", ["Wheat (Kanak)", "Rice (Basmati)", "Cotton", "Soybean", "Maize"])
            with col_f2:
                agreed_price = st.number_input("Agreed Price per Quintal (₹)", min_value=1000, max_value=25000, value=2400, step=50)
                quantity = st.number_input("Target Supply Quantity (Quintals)", min_value=10, max_value=10000, value=250, step=10)

            st.markdown("### 🚚 Step 2: Delivery & Payment Conditions")
            col_f3, col_f4 = st.columns(2)
            with col_f3:
                delivery_date = st.date_input("Target Delivery Date")
                payment_terms = st.selectbox("Payment Terms", [
                    "30% Advance, 70% Upon Quality Inspection",
                    "50% Advance, 50% On Delivery",
                    "100% Direct Bank Transfer On Delivery"
                ])
            with col_f4:
                quality_grade = st.selectbox("Moisture & Quality Grade Standard", [
                    "Grade A (Moisture < 12%)",
                    "Grade B (Moisture < 14%)",
                    "Standard Organic Certified"
                ])
                special_clauses = st.text_area("Special Clauses / Terms", value="Price lock applies regardless of market price fluctuations at time of harvest.")

            submit_contract = st.form_submit_button("🚀 Generate & Save Contract", use_container_width=True)

            if submit_contract:
                new_id = f"CTR-{1001 + len(st.session_state['contracts'])}"
                new_row = pd.DataFrame([{
                    "Contract ID": new_id,
                    "Buyer/Corporate": buyer_name,
                    "Crop": crop_name,
                    "Agreed Price (₹/Qtl)": agreed_price,
                    "Quantity (Qtl)": quantity,
                    "Delivery Date": str(delivery_date),
                    "Status": "Pending Approval",
                    "Payment Terms": payment_terms
                }])
                st.session_state["contracts"] = pd.concat([st.session_state["contracts"], new_row], ignore_index=True)
                st.success(f"Contract {new_id} created successfully and saved under 'My Contracts'!")

    # 5. WHATSAPP COMMUNICATION
    elif selected_nav == get_txt("nav_whatsapp"):
        st.markdown("""
        <div class="hero-header">
            <h2>💬 WhatsApp Communication & Direct Alerts</h2>
            <p>Send contract updates, weather warnings, and Mandi price alerts directly via WhatsApp</p>
        </div>
        """, unsafe_allow_html=True)

        col_wa1, col_wa2 = st.columns([1.5, 2])

        with col_wa1:
            st.markdown("### 📲 Message Generator")
            recipient_phone = st.text_input("Recipient WhatsApp Number (with Country Code)", value="+919876543210")
            msg_type = st.selectbox("Select Message Template", [
                "Contract Status Update",
                "Mandi Rate Alert",
                "Weather Warning & Irrigation Advisory",
                "Custom Notification"
            ])

            if msg_type == "Contract Status Update":
                default_msg = f"Hello! Your farming contract CTR-1001 for Wheat supply (500 Qtl) has been updated to ACTIVE status. Delivery Date: 2026-09-15. - Agricontact Team"
            elif msg_type == "Mandi Rate Alert":
                default_msg = f"🌿 Mandi Rate Update: Today's Basmati Rice rate in Karnal is ₹4,150/Qtl (▲ +0.5%). Check Agricontact app for more details."
            elif msg_type == "Weather Warning & Irrigation Advisory":
                default_msg = f"🌤️ Weather Warning: Heavy rainfall expected in your area over the next 48 hours. Please hold off on scheduled drip irrigation."
            else:
                default_msg = f"Hello from Agricontact Portal! Please reach out regarding your harvest schedule."

            user_msg = st.text_area("Message Content", value=default_msg, height=140)

            # Generate WhatsApp URL
            encoded_text = urllib.parse.quote(user_msg)
            clean_phone = recipient_phone.replace("+", "").replace(" ", "").replace("-", "")
            wa_link = f"https://wa.me/{clean_phone}?text={encoded_text}"

            st.markdown(f"""
            <br/>
            <a href="{wa_link}" target="_blank" class="wa-button">
                📱 Send Message on WhatsApp
            </a>
            """, unsafe_allow_html=True)

        with col_wa2:
            st.markdown("### 📜 Recent WhatsApp Broadcast Log")
            wa_logs = pd.DataFrame([
                {"Recipient": "AgriCorp India", "Type": "Contract Update", "Sent At": "Today, 09:30 AM", "Status": "Delivered ✅"},
                {"Recipient": "Regional Farmer Group", "Type": "Weather Alert", "Sent At": "Yesterday, 04:15 PM", "Status": "Read ✅"},
                {"Recipient": "Karnal Mandi Agent", "Type": "Mandi Rate Alert", "Sent At": "04 Aug 2026", "Status": "Delivered ✅"}
            ])
            st.dataframe(wa_logs, use_container_width=True, hide_index=True)

            st.markdown("""
            <div class="agri-card">
                <span class="badge badge-purple">Automated Broadcasts</span>
                <h4 style="margin-top: 8px;">WhatsApp Web Direct Link</h4>
                <p>Clicking the button will open WhatsApp Web or your mobile WhatsApp app with the message pre-filled. No extra API key required!</p>
            </div>
            """, unsafe_allow_html=True)

    # 6. CROP HEALTH & SOIL
    elif selected_nav == get_txt("nav_crop_health"):
        st.markdown("""
        <div class="hero-header">
            <h2>🌱 Crop Health & Soil Diagnostics</h2>
            <p>Custom fertilizer recommendations and pH soil testing guidance</p>
        </div>
        """, unsafe_allow_html=True)

        c1, c2, c3 = st.columns(3)
        with c1:
            crop = st.selectbox("Select Crop", ["Wheat", "Paddy/Rice", "Cotton", "Sugarcane"])
        with c2:
            soil = st.selectbox("Soil Type", ["Alluvial Soil", "Black Cotton Soil", "Red/Loamy Soil"])
        with c3:
            ph = st.slider("Soil pH Level", 4.0, 9.0, 6.5, 0.1)

        # pH Assessment status
        if 6.0 <= ph <= 7.5:
            ph_status = "Optimal / Neutral pH"
            badge_type = "badge-green"
            ph_advice = "Soil pH is ideal for nutrient absorption. Maintain current organic matter content."
        elif ph < 6.0:
            ph_status = "Acidic Soil Condition"
            badge_type = "badge-amber"
            ph_advice = "Soil is acidic. Apply Agricultural Lime (Calcium Carbonate) at 200-300 kg/acre to restore pH."
        else:
            ph_status = "Alkaline / Saline Soil"
            badge_type = "badge-purple"
            ph_advice = "Soil is alkaline. Apply Gypsum (Calcium Sulfate) and organic compost to lower alkalinity."

        st.markdown(f"""
        <div class="agri-card">
            <span class="badge {badge_type}">{ph_status}</span>
            <h3 style="margin-top: 8px; color: #065f46;">Soil pH Diagnostics: {ph}</h3>
            <p>{ph_advice}</p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("### 🧪 Recommended N-P-K Fertilizer Ratio (kg/acre)")
        npk_data = {
            "Wheat": {"Nitrogen (N)": 50, "Phosphorus (P)": 25, "Potassium (K)": 20},
            "Paddy/Rice": {"Nitrogen (N)": 60, "Phosphorus (P)": 30, "Potassium (K)": 25},
            "Cotton": {"Nitrogen (N)": 45, "Phosphorus (P)": 20, "Potassium (K)": 20},
            "Sugarcane": {"Nitrogen (N)": 100, "Phosphorus (P)": 50, "Potassium (K)": 40},
        }

        crop_npk = npk_data.get(crop, {"Nitrogen (N)": 50, "Phosphorus (P)": 25, "Potassium (K)": 20})
        df_npk = pd.DataFrame(list(crop_npk.items()), columns=["Nutrient", "Requirement (kg/acre)"])

        fig_npk = px.bar(df_npk, x="Nutrient", y="Requirement (kg/acre)", color="Nutrient",
                         color_discrete_sequence=["#10b981", "#3b82f6", "#f59e0b"],
                         text="Requirement (kg/acre)", title=f"NPK Nutrient Plan for {crop}")
        fig_npk.update_traces(texttemplate='%{text} kg', textposition='outside')
        fig_npk.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(255,255,255,0.7)')
        st.plotly_chart(fig_npk, use_container_width=True)

    # 7. PEST DIAGNOSTICS
    elif selected_nav == get_txt("nav_pest"):
        st.markdown("""
        <div class="hero-header">
            <h2>🐛 Pest Diagnostics & Crop Protection Guide</h2>
            <p>Identify common crop diseases, pests, and organic or chemical treatment protocols</p>
        </div>
        """, unsafe_allow_html=True)

        pests = [
            {
                "Crop": "Wheat",
                "Pest Name": "Yellow Rust (Puccinia striiformis)",
                "Symptoms": "Yellow pustules forming linear stripes on leaves, reduced seed weight.",
                "Organic Control": "Spray Neem oil extract (5ml/L) or Trichoderma viride.",
                "Chemical Control": "Apply Propiconazole 25% EC @ 1ml per liter of water."
            },
            {
                "Crop": "Paddy/Rice",
                "Pest Name": "Stem Borer (Scirpophaga incertulas)",
                "Symptoms": "Dead hearts in vegetative stage, white heads in panicle stage.",
                "Organic Control": "Install pheromone traps (5 traps/acre) and release Trichogramma chilonis.",
                "Chemical Control": "Apply Chlorantraniliprole 18.5% SC @ 60ml/acre."
            },
            {
                "Crop": "Cotton",
                "Pest Name": "Pink Bollworm (Pectinophora gossypiella)",
                "Symptoms": "Rosetted flowers, stained lint, premature boll opening.",
                "Organic Control": "Use gossyplure pheromone lures and neem cake soil application.",
                "Chemical Control": "Spray Profenofos 50% EC @ 2ml per liter of water."
            }
        ]

        pest_crop_filter = st.selectbox("Filter Pest Guide by Crop", ["All Crops", "Wheat", "Paddy/Rice", "Cotton"])
        
        for p in pests:
            if pest_crop_filter == "All Crops" or p["Crop"] == pest_crop_filter:
                st.markdown(f"""
                <div class="agri-card">
                    <span class="badge badge-amber">{p['Crop']}</span>
                    <h3 style="margin-top: 6px; color: #92400e;">🐛 {p['Pest Name']}</h3>
                    <p><b>🔍 Symptoms:</b> {p['Symptoms']}</p>
                    <p><b>🌿 Organic Treatment:</b> {p['Organic Control']}</p>
                    <p><b>🧪 Chemical Control:</b> {p['Chemical Control']}</p>
                </div>
                """, unsafe_allow_html=True)

    # 8. GOVT SCHEMES
    elif selected_nav == get_txt("nav_schemes"):
        st.markdown("""
        <div class="hero-header">
            <h2>🏛️ Government Agricultural Schemes & Subsidies</h2>
            <p>Direct access to official welfare initiatives, insurance, and financial support</p>
        </div>
        """, unsafe_allow_html=True)

        schemes = [
            {
                "Name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                "Benefit": "₹6,000 / year in 3 equal installments directly to bank account.",
                "Eligibility": "All landholding farmer families with cultivable land holdings.",
                "Category": "Direct Financial Benefit"
            },
            {
                "Name": "PM Fasal Bima Yojana (PMFBY)",
                "Benefit": "Comprehensive crop insurance cover against yield losses from non-preventable natural risks.",
                "Eligibility": "Farmers growing notified crops in notified areas.",
                "Category": "Insurance Support"
            },
            {
                "Name": "Soil Health Card Scheme",
                "Benefit": "Free soil testing and report detailing nutrient status and corrective measures.",
                "Eligibility": "Open to all farmers across India.",
                "Category": "Soil & Quality Support"
            }
        ]

        for s in schemes:
            st.markdown(f"""
            <div class="agri-card">
                <span class="badge badge-blue">{s['Category']}</span>
                <h3 style="margin-top: 6px; color: #1e40af;">🏛️ {s['Name']}</h3>
                <p><b>🎁 Benefit:</b> {s['Benefit']}</p>
                <p><b>✅ Eligibility:</b> {s['Eligibility']}</p>
            </div>
            """, unsafe_allow_html=True)

    # 9. MY PROFILE
    elif selected_nav == get_txt("nav_profile"):
        st.markdown("""
        <div class="hero-header">
            <h2>👤 Farmer Profile & Account Management</h2>
            <p>Manage your registered personal details, land size, and portal security</p>
        </div>
        """, unsafe_allow_html=True)

        col_p1, col_p2 = st.columns([1, 1.5])
        with col_p1:
            st.markdown(f"""
            <div class="agri-card">
                <h3>{user['name']}</h3>
                <p><b>📧 Email:</b> {user['email']}</p>
                <p><b>🌐 Preferred Language:</b> {user.get('language', 'en').upper()}</p>
                <p><b>🛡️ Role:</b> {"Admin" if user.get("is_admin") == 1 else "Standard User"}</p>
            </div>
            """, unsafe_allow_html=True)

        with col_p2:
            with st.form("update_profile_form"):
                st.markdown("### ✏️ Update Profile Details")
                new_name = st.text_input("Full Name", value=user['name'])
                farm_size = st.number_input("Land Holding Size (Acres)", min_value=0.5, max_value=500.0, value=12.5, step=0.5)
                primary_crop = st.selectbox("Primary Crop Grown", ["Wheat", "Paddy", "Cotton", "Sugarcane", "Soybean"])
                save_prof = st.form_submit_button("Save Profile Changes", use_container_width=True)
                if save_prof:
                    st.success("Profile updated successfully!")

    # 10. SYSTEM SETTINGS
    elif selected_nav == get_txt("nav_settings"):
        st.markdown("""
        <div class="hero-header">
            <h2>⚙️ System Settings & Data Export</h2>
            <p>Export portal contract records, clear cache, and check database connections</p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("### 📥 Data Export Center")
        contracts_df = st.session_state["contracts"]

        col_ex1, col_ex2 = st.columns(2)
        with col_ex1:
            csv_data = convert_df_to_csv(contracts_df)
            st.download_button(
                label="📄 Export Contracts as CSV",
                data=csv_data,
                file_name="agricontact_contracts.csv",
                mime="text/csv",
                use_container_width=True
            )
        with col_ex2:
            try:
                excel_data = convert_df_to_excel(contracts_df)
                st.download_button(
                    label="📊 Export Contracts as Excel (.xlsx)",
                    data=excel_data,
                    file_name="agricontact_contracts.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    use_container_width=True
                )
            except Exception as e:
                st.info("Excel export engine initializing or unavailable.")

        st.markdown("---")
        st.markdown("### 🔧 Technical Diagnostics")
        db_status = "Connected to PostgreSQL Database" if HAS_PSYCOPG2 and get_db_url() else "Running in Local Session State Mode"
        st.markdown(f"""
        <div class="agri-card">
            <p><b>Database Status:</b> {db_status}</p>
            <p><b>Streamlit Engine:</b> v{st.__version__}</p>
        </div>
        """, unsafe_allow_html=True)

    # 11. ADMIN PANEL (Only accessible if is_admin == 1)
    elif selected_nav == get_txt("nav_admin") and user.get("is_admin") == 1:
        st.markdown("""
        <div class="hero-header">
            <h2>👑 System Admin Control Panel</h2>
            <p>User administration, system oversight, and full database records</p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("### 👥 Registered Users")
        users_df = get_all_users()
        st.dataframe(users_df, use_container_width=True, hide_index=True)

        st.markdown("### ➕ Register New System User")
        with st.form("admin_register_user"):
            ca1, ca2 = st.columns(2)
            with ca1:
                adm_name = st.text_input("Full Name")
                adm_email = st.text_input("Email Address")
            with ca2:
                adm_pass = st.text_input("Password", type="password")
                adm_role = st.selectbox("Assign Role", ["Standard Farmer (0)", "Admin (1)"])
            
            is_adm_flag = 1 if "Admin" in adm_role else 0
            if st.form_submit_button("Create User Account", use_container_width=True):
                if adm_name and adm_email and adm_pass:
                    ok, msg = register_user(adm_name, adm_email, adm_pass, is_admin=is_adm_flag)
                    if ok:
                        st.success(f"User '{adm_name}' created successfully!")
                        st.rerun()
                    else:
                        st.error(f"Error creating user: {msg}")