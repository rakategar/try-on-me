# Try-On-Me - Virtual T-Shirt Try-On App

Aplikasi web mobile untuk virtual try-on kaos secara real-time menggunakan kamera smartphone dengan teknologi AI body detection dan 3D rendering.

## 📱 Overview

Try-On-Me adalah progressive web app (PWA) yang memungkinkan pengguna untuk mencoba kaos secara virtual melalui kamera smartphone mereka. Aplikasi ini menggunakan AI untuk mendeteksi tubuh pengguna dan menampilkan model 3D kaos yang mengikuti gerakan real-time.

## 🚀 Tech Stack

### Core Framework
- **Next.js 14+** - React framework untuk production
  - 📦 Website: https://nextjs.org/
  - 📚 Docs: https://nextjs.org/docs
  - Install: `npx create-next-app@latest`

### 3D Graphics
- **Three.js** - Library 3D rendering untuk web
  - 📦 NPM: https://www.npmjs.com/package/three
  - 📚 Docs: https://threejs.org/docs/
  - 🎓 Examples: https://threejs.org/examples/
  - Install: `npm install three @types/three`

- **@react-three/fiber** - React renderer untuk Three.js
  - 📦 NPM: https://www.npmjs.com/package/@react-three/fiber
  - 📚 Docs: https://docs.pmnd.rs/react-three-fiber/
  - Install: `npm install @react-three/fiber`

- **@react-three/drei** - Helper utilities untuk R3F
  - 📦 NPM: https://www.npmjs.com/package/@react-three/drei
  - 📚 Docs: https://github.com/pmndrs/drei
  - Install: `npm install @react-three/drei`

### AI & Computer Vision
- **@tensorflow/tfjs** - TensorFlow untuk JavaScript
  - 📦 NPM: https://www.npmjs.com/package/@tensorflow/tfjs
  - 📚 Docs: https://www.tensorflow.org/js
  - Install: `npm install @tensorflow/tfjs`

- **@tensorflow-models/pose-detection** - Model deteksi pose tubuh
  - 📦 NPM: https://www.npmjs.com/package/@tensorflow-models/pose-detection
  - 📚 Docs: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
  - Install: `npm install @tensorflow-models/pose-detection`

- **@mediapipe/pose** - Alternative pose detection (Recommended)
  - 📦 NPM: https://www.npmjs.com/package/@mediapipe/pose
  - 📚 Docs: https://google.github.io/mediapipe/solutions/pose.html
  - Install: `npm install @mediapipe/pose`

### State Management
- **Zustand** - Lightweight state management
  - 📦 NPM: https://www.npmjs.com/package/zustand
  - 📚 Docs: https://docs.pmnd.rs/zustand/getting-started/introduction
  - Install: `npm install zustand`

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
  - 📦 Website: https://tailwindcss.com/
  - 📚 Docs: https://tailwindcss.com/docs
  - Install: Included in Next.js setup

- **Lucide React** - Icon library
  - 📦 NPM: https://www.npmjs.com/package/lucide-react
  - 📚 Icons: https://lucide.dev/icons/
  - Install: `npm install lucide-react`

### Additional Libraries
- **html2canvas** - Screenshot functionality
  - 📦 NPM: https://www.npmjs.com/package/html2canvas
  - Install: `npm install html2canvas`

- **leva** - GUI controls untuk debugging (dev only)
  - 📦 NPM: https://www.npmjs.com/package/leva
  - Install: `npm install leva`

## 📋 Prerequisites

- Node.js 18.x atau lebih baru
- npm atau yarn atau pnpm
- Git
- Text editor (VS Code recommended)

## 🛠️ Installation

### 1. Create Next.js Project

```bash
npx create-next-app@latest try-on-me
```

Pilih opsi berikut saat setup:
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ `src/` directory: Yes
- ✅ App Router: Yes
- ❌ Import alias: No (atau default @/*)

### 2. Navigate ke Project

```bash
cd try-on-me
```

### 3. Install Dependencies

```bash
# Core 3D libraries
npm install three @types/three @react-three/fiber @react-three/drei

# AI/ML libraries - MediaPipe (Recommended)
npm install @mediapipe/pose @mediapipe/camera_utils @mediapipe/drawing_utils

# Alternative: TensorFlow (lebih berat)
# npm install @tensorflow/tfjs @tensorflow-models/pose-detection

# State management
npm install zustand

# UI libraries
npm install lucide-react

# Utilities
npm install html2canvas

# Dev dependencies
npm install -D leva
```

### 4. Install semua sekaligus (Copy-Paste)

```bash
npm install three @types/three @react-three/fiber @react-three/drei @mediapipe/pose @mediapipe/camera_utils @mediapipe/drawing_utils zustand lucide-react html2canvas leva
```

## 📁 Project Structure

```
try-on-me/
├── public/
│   ├── models/
│   │   ├── tshirt-basic.glb      # 3D model kaos
│   │   └── textures/
│   │       ├── design1.jpg
│   │       ├── design2.jpg
│   │       └── design3.jpg
│   └── icons/
│       └── icon-512x512.png
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── manifest.ts           # PWA manifest
│   ├── components/
│   │   ├── Camera/
│   │   │   ├── CameraView.tsx
│   │   │   ├── CameraControls.tsx
│   │   │   └── PermissionPrompt.tsx
│   │   ├── Detection/
│   │   │   ├── PoseDetector.tsx
│   │   │   └── BodyLandmarks.tsx
│   │   ├── ThreeD/
│   │   │   ├── TShirtModel.tsx
│   │   │   ├── Scene.tsx
│   │   │   └── Lighting.tsx
│   │   ├── UI/
│   │   │   ├── DesignSelector.tsx
│   │   │   ├── SizeSelector.tsx
│   │   │   ├── CaptureButton.tsx
│   │   │   └── Instructions.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── LoadingScreen.tsx
│   ├── hooks/
│   │   ├── useCamera.ts
│   │   ├── usePoseDetection.ts
│   │   ├── useBodyTracking.ts
│   │   └── useScreenCapture.ts
│   ├── store/
│   │   ├── appStore.ts            # Zustand store
│   │   └── designStore.ts
│   ├── lib/
│   │   ├── poseDetection.ts
│   │   ├── bodyCalibration.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── pose.ts
│   │   └── product.ts
│   └── constants/
│       └── config.ts
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## ⚙️ Configuration

### 1. Next.js Config (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable untuk production dengan HTTPS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*',
          },
        ],
      },
    ];
  },
  // Webpack config untuk Three.js
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig;
```

### 2. Tailwind Config untuk Mobile-First

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      height: {
        'screen-safe': '100dvh', // Dynamic viewport height for mobile
      },
    },
  },
  plugins: [],
};

export default config;
```

### 3. Environment Variables (`.env.local`)

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME=Try-On-Me
NEXT_PUBLIC_APP_URL=https://try-on-me.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEBUG_MODE=true

# Camera Settings
NEXT_PUBLIC_CAMERA_FPS=30
NEXT_PUBLIC_CAMERA_WIDTH=1280
NEXT_PUBLIC_CAMERA_HEIGHT=720

# AI Model Settings
NEXT_PUBLIC_POSE_MODEL=mediapipe
NEXT_PUBLIC_DETECTION_CONFIDENCE=0.7
```

## 🎨 Getting 3D Models

### Opsi 1: Buat Sendiri
- **Blender** (Free): https://www.blender.org/
  - Tutorial: https://www.youtube.com/results?search_query=blender+tshirt+modeling
  - Export ke .glb atau .gltf format

### Opsi 2: Download Free Models
- **Sketchfab**: https://sketchfab.com/search?q=tshirt&type=models
  - Filter: Free, Downloadable
  - Format: glTF (.glb)

- **TurboSquid**: https://www.turbosquid.com/Search/3D-Models/free/tshirt

- **CGTrader**: https://www.cgtrader.com/free-3d-models/tshirt

### Opsi 3: Commissioned Models
- Hire di Fiverr atau Upwork
- Spesifikasi: Low-poly (< 5000 triangles), .glb format, UV mapped

### Model Requirements
- Format: `.glb` (preferred) atau `.gltf`
- Poly count: < 10,000 triangles untuk mobile
- Texture size: 1024x1024 atau 2048x2048
- UV mapped dengan proper seams

## 🚦 Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Buka browser: http://localhost:3000

### 2. Test di Mobile

#### Opsi A: Local Network
```bash
# Get your local IP
# Windows: ipconfig
# Mac/Linux: ifconfig

# Access dari phone: http://192.168.x.x:3000
```

#### Opsi B: ngrok (untuk testing kamera)
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Access dari URL yang diberikan (https required untuk camera)
```

### 3. Debug Tools

```bash
# Di browser mobile
# Chrome: chrome://inspect
# Safari: Develop > [Your Device]
```

## 📱 PWA Configuration

### 1. Create Manifest (`src/app/manifest.ts`)

```typescript
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Try-On-Me',
    short_name: 'TryOnMe',
    description: 'Virtual T-Shirt Try-On App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

### 2. Add Icons

Generate icons di: https://www.pwabuilder.com/imageGenerator

## 🔧 Development Tips

### Mobile Testing Checklist
- [ ] Responsive di berbagai ukuran layar
- [ ] Touch gestures berfungsi
- [ ] Camera permission handling
- [ ] Performance 30+ FPS
- [ ] Battery efficient
- [ ] Works offline (PWA)
- [ ] Install prompt works

### Performance Optimization
1. **Lazy load 3D models**
2. **Reduce texture sizes** untuk mobile
3. **Use `useMemo` dan `useCallback`** untuk heavy computations
4. **Implement loading states**
5. **Optimize pose detection frequency** (15-30 FPS)

### Common Issues & Solutions

**Issue: Camera tidak muncul**
- Solution: Test dengan HTTPS (gunakan ngrok)
- Check: Browser permissions

**Issue: Lag/stuttering**
- Solution: Reduce 3D model complexity
- Lower camera resolution
- Reduce pose detection frequency

**Issue: Model tidak align dengan body**
- Solution: Calibrate landmark mapping
- Adjust model scaling logic

## 📚 Learning Resources

### Next.js
- Official Tutorial: https://nextjs.org/learn
- Documentation: https://nextjs.org/docs

### Three.js
- Journey Tutorial: https://threejs-journey.com/ (Best course)
- Documentation: https://threejs.org/docs/
- Examples: https://threejs.org/examples/

### React Three Fiber
- Official Docs: https://docs.pmnd.rs/react-three-fiber/
- Examples: https://docs.pmnd.rs/react-three-fiber/getting-started/examples

### Pose Detection
- MediaPipe Guide: https://google.github.io/mediapipe/solutions/pose.html
- TensorFlow.js: https://www.tensorflow.org/js/tutorials

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Alternative Platforms
- **Netlify**: https://www.netlify.com/
- **Railway**: https://railway.app/
- **AWS Amplify**: https://aws.amazon.com/amplify/

### Pre-deployment Checklist
- [ ] Test di real mobile device
- [ ] Optimize assets (images, 3D models)
- [ ] Enable production error tracking
- [ ] Setup analytics
- [ ] Configure HTTPS
- [ ] Test camera permissions
- [ ] PWA install flow

## 📞 Support & Community

- **Next.js Discord**: https://discord.gg/nextjs
- **Three.js Discord**: https://discord.gg/threejs
- **Poimandres Discord**: https://discord.gg/poimandres (R3F)

## 📄 License

MIT License - Feel free to use for your brand!

---

**Happy Coding! 🚀**

Untuk pertanyaan atau issue, buat issue di GitHub repository Anda atau hubungi tim development Anda.