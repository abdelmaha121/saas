import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary">
                <span className="text-2xl font-bold text-white">خد</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">منصة الخدمات</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              منصة رائدة لربط العملاء بمقدمي الخدمات المعتمدين. نوفر لك خدمات موثوقة وعالية الجودة في جميع المجالات.
            </p>
            <div className="flex gap-3">
              <Link
                href="https://facebook.com"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://instagram.com"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  الخدمات
                </Link>
              </li>
              <li>
                <Link href="/providers" className="text-muted-foreground hover:text-primary transition-colors">
                  مقدمو الخدمات
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  كيف تعمل
                </Link>
              </li>
              <li>
                <Link href="/become-provider" className="text-muted-foreground hover:text-primary transition-colors">
                  انضم كمزود خدمة
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors">
                  الوظائف
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">الدعم والمساعدة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-muted-foreground hover:text-primary transition-colors">
                  سياسة الاسترجاع
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">
                  طريق الملك فهد، الرياض 12345
                  <br />
                  المملكة العربية السعودية
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:+966501234567" className="text-muted-foreground hover:text-primary transition-colors">
                  +966 50 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:info@services.sa" className="text-muted-foreground hover:text-primary transition-colors">
                  info@services.sa
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">اشترك في النشرة البريدية</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-4 py-2 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium">
                  اشترك
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} منصة الخدمات. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                الشروط والأحكام
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                الخصوصية
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                سياسة الكوكيز
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
