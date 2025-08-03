import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Search,
  MessageSquare,
  BarChart3,
  Upload,
  Zap,
  Brain,
  Sparkles,
  Target,
  Cpu,
  Network,
} from "lucide-react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/optimized-image"

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src="/illustration-anime-city.jpg"
          alt="Anime City Background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/70 to-slate-900/80"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                ThaiJoy
              </h1>
              <p className="text-xs text-purple-200">AI & Tech Research Intelligence</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
              { href: "/summarize", label: "Analyze", icon: FileText },
              { href: "/match", label: "Discover", icon: Search },
              { href: "/chat", label: "AI Chat", icon: MessageSquare },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center space-x-2 text-purple-200 hover:text-white transition-all duration-300"
              >
                <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="relative">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            ))}
          </nav>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            <Link href="/dashboard">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Research
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
            </div>
            <h2 className="relative text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 leading-tight">
              AI Research
              <br />
              <span className="text-5xl md:text-6xl">Personal Research Paper Assistant</span>
            </h2>
          </div>
          <p className="text-xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          ผู้ช่วย AI ในการทำงานวิจัย ที่เกี่ยวข้องกับเทคโนโลยี และปัญญาประดิษฐ์ ด้วยระบบการวิเคราะห์งานวิจัยเชิงลึก และระบบ Conversational Chat ตอบคำถามเกี่ยวกับงานวิจัยอย่างละเอียด นอกจากนี้ยังมีระบบแนะนำงานวิจัยที่เกี่ยวข้องกับ
          โปรเจคของผู้ใช้งาน เพื่อหา Improvement Gap และแนวทางในการพัฒนางานต่อไป 
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
            >
              <Link href="/summarize">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  <span>Analyze AI Papers</span>
                  <Sparkles className="h-4 w-4 group-hover:animate-spin" />
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group border-purple-400/50 text-purple-200 hover:bg-purple-500/20 hover:border-purple-300 backdrop-blur-sm transition-all duration-300 bg-transparent"
            >
              <Link href="/match">
                <Network className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Find Tech Connections
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
              Advanced AI Research Tools
            </h3>
            <p className="text-purple-200 text-lg">Specialized AI สำหรับงานวิจัย และเทคโนโลยี</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Paper Analysis",
                description: "Deep Learning ช่วยดึงข้อมูลเชิงลึกที่สำคัญจากงานวิจัยด้านการเรียนรู้ของเครื่อง การเรียนรู้เชิงลึก และปัญญาประดิษฐ์",
                gradient: "from-blue-500 to-purple-600",
                delay: "0ms",
              },
              {
                icon: Network,
                title: "Tech Pattern Discovery",
                description: "ค้นพบความเชื่อมโยงใน Computer Vision, NLP, หุ่นยนต์, และเทคโนโลยีที่เกิดขึ้นใหม่",
                gradient: "from-purple-500 to-pink-600",
                delay: "200ms",
              },
              {
                icon: Cpu,
                title: "Algorithm Intelligence",
                description: "AI assistant ที่มีความเข้าใจใน algorithms และ architectures ที่มีความซับซ้อน",
                gradient: "from-pink-500 to-red-600",
                delay: "400ms",
              },
              {
                icon: Target,
                title: "Research Trajectory",
                description: "ติดตามเส้นทางการวิจัย AI ของผู้ใช้งานและแนะนำงานวิจัยที่เกี่ยวข้อง",
                gradient: "from-green-500 to-blue-600",
                delay: "600ms",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: feature.delay }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                ></div>
                <CardHeader className="relative z-10">
                  <div
                    className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl mb-3 group-hover:text-purple-200 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-purple-200 leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Stats Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { number: "2.5M+", label: "AI Papers Analyzed", icon: FileText },
              { number: "150K+", label: "Tech Connections Found", icon: Network },
              { number: "99.7%", label: "Algorithm Accuracy", icon: Cpu },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                    <stat.icon className="h-8 w-8 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <div className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-purple-200">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
                Ready to Decode AI Research?
              </h3>
              <p className="text-purple-100 mb-8 text-lg max-w-2xl mx-auto">
                เริ่มต้นการวิจัย AI ของคุณด้วย ThaiJoy ผู้ช่วย AI ที่ออกแบบมาเพื่อช่วยให้คุณเข้าใจงานวิจัยด้านปัญญาประดิษฐ์และเทคโนโลยีอย่างลึกซึ้ง
              </p>
              <Button
                asChild
                size="lg"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
              >
                <Link href="/dashboard">
                  <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Begin AI Research
                  <Sparkles className="ml-2 h-4 w-4 group-hover:animate-spin" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/20 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              ThaiJoy
            </span>
          </div>
          <p className="text-purple-300">Advancing AI research through intelligent analysis</p>
        </div>
      </footer>
    </div>
  )
}
