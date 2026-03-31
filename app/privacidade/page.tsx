import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    /* pt-32 para descer o conteúdo da Navbar. mesmo estilo de fundo que a home. */
    <main
      className="min-h-screen font-sans pt-32 pb-20 px-6"
      style={{ background: "#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')" }}
    >
      
      <div className="max-w-4xl mx-auto prose prose-slate prose-quoteless">
        
        {/* Header com estilo de papel antigo/editorial */}
        <header className="border-b border-amber-200 pb-8 mb-12">
          <h1 className="text-4xl font-serif text-amber-950 mb-2">
            Política de Privacidade
          </h1>
          <p className="text-sm font-medium text-amber-800/70 italic uppercase tracking-wider">
            Atualizado em 31 de Março de 2026
          </p>
        </header>

        <section className="space-y-10 text-slate-800">
          
          <div>
            <h2 className="text-amber-900 flex items-center gap-2 border-l-4 border-amber-400 pl-4">
              1. Responsável pelo Tratamento
            </h2>
            <p className="leading-relaxed">
              O <strong>Clube das Leitoras</strong> ("nosso Clube") é o responsável pelo tratamento dos dados pessoais dos participantes, garantindo que sua jornada literária ocorra em um ambiente seguro e transparente.
            </p>
          </div>

          <div>
            <h2 className="text-amber-900 flex items-center gap-2 border-l-4 border-amber-400 pl-4">
              2. Finalidade do Tratamento
            </h2>
            <p>Coletamos dados para permitir o cadastro, acesso ao portal e participação em nossas atividades:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0 mt-4">
              <li className="bg-white/60 p-4 rounded-xl border border-amber-100 shadow-sm">
                <span className="block font-bold text-amber-800 mb-1">🔐 Segurança</span>
                Identificação e acesso seguro ao painel (e-mail, senha, tokens).
              </li>
              <li className="bg-white/60 p-4 rounded-xl border border-amber-100 shadow-sm">
                <span className="block font-bold text-amber-800 mb-1">📱 Conectividade</span>
                Avisos de encontros e novidades via e-mail ou WhatsApp.
              </li>
              <li className="bg-white/60 p-4 rounded-xl border border-amber-100 shadow-sm md:col-span-2">
                <span className="block font-bold text-amber-800 mb-1">📦 Experiência do Clube</span>
                Curadoria e entrega de mimos literários (endereço e preferências).
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8 py-4">
            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
              <h3 className="text-amber-900 mt-0">3. Dados coletados</h3>
              <p className="text-sm">Processamos: Nome completo, e-mail, telefone, data de nascimento, endereço residencial e histórico de leitura no Clube.</p>
            </div>
            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
              <h3 className="text-amber-900 mt-0">4. Base legal</h3>
              <p className="text-sm">Tratamos dados com base no seu consentimento, na execução do nosso serviço e no cumprimento de normas legais.</p>
            </div>
          </div>

          <div className="bg-white/80 p-8 rounded-3xl border border-amber-200 shadow-sm transition-hover hover:shadow-md">
            <h2 className="text-amber-950 mt-0">5. Seus Direitos</h2>
            <p>Como titular dos dados, você pode solicitar a qualquer momento:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-900 font-medium">
              <li>• Acesso e correção de dados</li>
              <li>• Portabilidade das informações</li>
              <li>• Eliminação total da conta</li>
              <li>• Revogação de consentimento</li>
            </ul>
            <hr className="my-6 border-amber-100" />
            <p className="text-sm m-0">
              Para exercer seus direitos, use o painel da conta ou envie um e-mail para: 
              <a href="mailto:clubedasleitorasbsb@gmail.com" className="ml-1 font-bold text-amber-700 hover:text-amber-900 underline decoration-amber-300 underline-offset-4">
                clubedasleitorasbsb@gmail.com
              </a>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 border-t border-amber-200 pt-8">
            <section>
              <h3 className="text-amber-900 text-lg">6. Cookies</h3>
              <p className="text-sm leading-relaxed">Utilizamos cookies apenas para autenticação e lembrar suas preferências. Você pode bloqueá-los no navegador, mas isso afetará o login.</p>
            </section>
            <section>
              <h3 className="text-amber-900 text-lg">7. Compartilhamento</h3>
              <p className="text-sm leading-relaxed">Compartilhamos dados estritamente necessários com serviços de disparo de e-mails (Brevo/Resend) e nunca vendemos seus dados.</p>
            </section>
          </div>

          <footer className="text-center pt-12">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-amber-800 text-white rounded-full font-semibold hover:bg-amber-900 transition-colors no-underline"
            >
              Voltar ao Início
            </Link>
          </footer>

        </section>
      </div>
    </main>
  );
}