# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sorteios.spec.ts >> sorteios page performs a full draw after adding a participant
- Location: tests/playwright/sorteios.spec.ts:22:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForResponse: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic:
      - img "Logo"
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - link "Logo Clube das Leitoras Clube das Leitoras Brasília • DF" [ref=e5] [cursor=pointer]:
          - /url: /
          - img "Logo Clube das Leitoras" [ref=e7]
          - generic [ref=e8]:
            - generic [ref=e9]: Clube das Leitoras
            - generic [ref=e10]: Brasília • DF
        - generic [ref=e11]:
          - button "Conexões" [ref=e14]:
            - text: Conexões
            - img [ref=e15]
          - link "Entrar" [ref=e18] [cursor=pointer]:
            - /url: /login
            - img [ref=e19]
            - text: Entrar
    - main [ref=e22]:
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e27]: Mimo Mensal
          - heading "Sorteios do Clube" [level=1] [ref=e29]
          - generic [ref=e30]:
            - generic [ref=e31]:
              - img [ref=e32]
              - paragraph [ref=e35]: Todo mês sorteamos um presente para quem compartilha essa travessia literária com a gente.
            - paragraph [ref=e36]: Nome na urna, sorteio transparente e novo ciclo a cada mês.
        - main [ref=e37]:
          - generic [ref=e40]:
            - heading "A Urna" [level=2] [ref=e41]
            - generic [ref=e42]:
              - textbox "Digite seu nome" [ref=e43]:
                - /placeholder: Nome completo...
              - button "Depositar Nome" [active] [ref=e44]
            - generic [ref=e45]:
              - generic [ref=e46]:
                - heading "Nomes Confirmados" [level=3] [ref=e47]
                - paragraph [ref=e48]: Urna aberta para novos nomes
              - generic [ref=e49]: 54 nomes
            - list [ref=e51]:
              - listitem [ref=e52]:
                - generic [ref=e53]: Kate Elen Silvério Lopes
                - button "Remover Kate Elen Silvério Lopes" [ref=e54]:
                  - img [ref=e55]
              - listitem [ref=e58]:
                - generic [ref=e59]: Débora Alves Pereira
                - button "Remover Débora Alves Pereira" [ref=e60]:
                  - img [ref=e61]
              - listitem [ref=e64]:
                - generic [ref=e65]: Denise Gonzalez
                - button "Remover Denise Gonzalez" [ref=e66]:
                  - img [ref=e67]
              - listitem [ref=e70]:
                - generic [ref=e71]: Mariana Coutinho
                - button "Remover Mariana Coutinho" [ref=e72]:
                  - img [ref=e73]
              - listitem [ref=e76]:
                - generic [ref=e77]: Raquel Barros
                - button "Remover Raquel Barros" [ref=e78]:
                  - img [ref=e79]
              - listitem [ref=e82]:
                - generic [ref=e83]: Flávia Araujo de Melo
                - button "Remover Flávia Araujo de Melo" [ref=e84]:
                  - img [ref=e85]
              - listitem [ref=e88]:
                - generic [ref=e89]: Milena Mello Rocha
                - button "Remover Milena Mello Rocha" [ref=e90]:
                  - img [ref=e91]
              - listitem [ref=e94]:
                - generic [ref=e95]: Alessandra Avila Correia
                - button "Remover Alessandra Avila Correia" [ref=e96]:
                  - img [ref=e97]
              - listitem [ref=e100]:
                - generic [ref=e101]: Estela Meira Maciel
                - button "Remover Estela Meira Maciel" [ref=e102]:
                  - img [ref=e103]
              - listitem [ref=e106]:
                - generic [ref=e107]: Michelli Lopes
                - button "Remover Michelli Lopes" [ref=e108]:
                  - img [ref=e109]
              - listitem [ref=e112]:
                - generic [ref=e113]: Vivianne Eilers
                - button "Remover Vivianne Eilers" [ref=e114]:
                  - img [ref=e115]
              - listitem [ref=e118]:
                - generic [ref=e119]: Loise Rodriguez
                - button "Remover Loise Rodriguez" [ref=e120]:
                  - img [ref=e121]
              - listitem [ref=e124]:
                - generic [ref=e125]: Karine Barbosa da Silva
                - button "Remover Karine Barbosa da Silva" [ref=e126]:
                  - img [ref=e127]
              - listitem [ref=e130]:
                - generic [ref=e131]: Ana Carolina Barbosa de Souza
                - button "Remover Ana Carolina Barbosa de Souza" [ref=e132]:
                  - img [ref=e133]
              - listitem [ref=e136]:
                - generic [ref=e137]: Nayra Priscila Guedes dos Santos
                - button "Remover Nayra Priscila Guedes dos Santos" [ref=e138]:
                  - img [ref=e139]
              - listitem [ref=e142]:
                - generic [ref=e143]: Diana Lisbôa Dias
                - button "Remover Diana Lisbôa Dias" [ref=e144]:
                  - img [ref=e145]
              - listitem [ref=e148]:
                - generic [ref=e149]: Kelly Gomes de Melo
                - button "Remover Kelly Gomes de Melo" [ref=e150]:
                  - img [ref=e151]
              - listitem [ref=e154]:
                - generic [ref=e155]: Samila Costa de Araújo
                - button "Remover Samila Costa de Araújo" [ref=e156]:
                  - img [ref=e157]
              - listitem [ref=e160]:
                - generic [ref=e161]: ELIANE SILVA BARBOSA DE BRITO
                - button "Remover ELIANE SILVA BARBOSA DE BRITO" [ref=e162]:
                  - img [ref=e163]
              - listitem [ref=e166]:
                - generic [ref=e167]: Débora de Morais Silva Vicente
                - button "Remover Débora de Morais Silva Vicente" [ref=e168]:
                  - img [ref=e169]
              - listitem [ref=e172]:
                - generic [ref=e173]: Amanda pires melo dos santos
                - button "Remover Amanda pires melo dos santos" [ref=e174]:
                  - img [ref=e175]
              - listitem [ref=e178]:
                - generic [ref=e179]: Verlucia amaro
                - button "Remover Verlucia amaro" [ref=e180]:
                  - img [ref=e181]
              - listitem [ref=e184]:
                - generic [ref=e185]: Daniella Flores Gama Molas
                - button "Remover Daniella Flores Gama Molas" [ref=e186]:
                  - img [ref=e187]
              - listitem [ref=e190]:
                - generic [ref=e191]: Erika de Jesus
                - button "Remover Erika de Jesus" [ref=e192]:
                  - img [ref=e193]
              - listitem [ref=e196]:
                - generic [ref=e197]: Leonora Brasil Pedrosa
                - button "Remover Leonora Brasil Pedrosa" [ref=e198]:
                  - img [ref=e199]
              - listitem [ref=e202]:
                - generic [ref=e203]: Thaís de Souza Abreu Jacintho
                - button "Remover Thaís de Souza Abreu Jacintho" [ref=e204]:
                  - img [ref=e205]
              - listitem [ref=e208]:
                - generic [ref=e209]: Livea Chefer
                - button "Remover Livea Chefer" [ref=e210]:
                  - img [ref=e211]
              - listitem [ref=e214]:
                - generic [ref=e215]: Márcia Gomes
                - button "Remover Márcia Gomes" [ref=e216]:
                  - img [ref=e217]
              - listitem [ref=e220]:
                - generic [ref=e221]: Lisys Carvalho Castilho
                - button "Remover Lisys Carvalho Castilho" [ref=e222]:
                  - img [ref=e223]
              - listitem [ref=e226]:
                - generic [ref=e227]: Ana Júlia Pereira Gonçalves
                - button "Remover Ana Júlia Pereira Gonçalves" [ref=e228]:
                  - img [ref=e229]
              - listitem [ref=e232]:
                - generic [ref=e233]: Ana Cláudia Pereira Gonçalves
                - button "Remover Ana Cláudia Pereira Gonçalves" [ref=e234]:
                  - img [ref=e235]
              - listitem [ref=e238]:
                - generic [ref=e239]: Cristiane Calixto
                - button "Remover Cristiane Calixto" [ref=e240]:
                  - img [ref=e241]
              - listitem [ref=e244]:
                - generic [ref=e245]: Haianne Thompson Hussein de Cerqueira Monteiro
                - button "Remover Haianne Thompson Hussein de Cerqueira Monteiro" [ref=e246]:
                  - img [ref=e247]
              - listitem [ref=e250]:
                - generic [ref=e251]: Andrea Ferreira Ribeiro
                - button "Remover Andrea Ferreira Ribeiro" [ref=e252]:
                  - img [ref=e253]
              - listitem [ref=e256]:
                - generic [ref=e257]: Izabella Gobbi Arantes
                - button "Remover Izabella Gobbi Arantes" [ref=e258]:
                  - img [ref=e259]
              - listitem [ref=e262]:
                - generic [ref=e263]: Ana Cecília de Freitas Santos
                - button "Remover Ana Cecília de Freitas Santos" [ref=e264]:
                  - img [ref=e265]
              - listitem [ref=e268]:
                - generic [ref=e269]: Wendy Rebeca Tavares do Nascimento
                - button "Remover Wendy Rebeca Tavares do Nascimento" [ref=e270]:
                  - img [ref=e271]
              - listitem [ref=e274]:
                - generic [ref=e275]: Nathalia Braga Fayão Oliveira
                - button "Remover Nathalia Braga Fayão Oliveira" [ref=e276]:
                  - img [ref=e277]
              - listitem [ref=e280]:
                - generic [ref=e281]: Lydia Queiroz
                - button "Remover Lydia Queiroz" [ref=e282]:
                  - img [ref=e283]
              - listitem [ref=e286]:
                - generic [ref=e287]: Denise Andrade
                - button "Remover Denise Andrade" [ref=e288]:
                  - img [ref=e289]
              - listitem [ref=e292]:
                - generic [ref=e293]: Leonice França
                - button "Remover Leonice França" [ref=e294]:
                  - img [ref=e295]
              - listitem [ref=e298]:
                - generic [ref=e299]: Dryelle Oliveira Dias Leão
                - button "Remover Dryelle Oliveira Dias Leão" [ref=e300]:
                  - img [ref=e301]
              - listitem [ref=e304]:
                - generic [ref=e305]: Thais Teixeira Carvalho
                - button "Remover Thais Teixeira Carvalho" [ref=e306]:
                  - img [ref=e307]
              - listitem [ref=e310]:
                - generic [ref=e311]: Giselle Silva dos Santos
                - button "Remover Giselle Silva dos Santos" [ref=e312]:
                  - img [ref=e313]
              - listitem [ref=e316]:
                - generic [ref=e317]: Carla Leoncÿ
                - button "Remover Carla Leoncÿ" [ref=e318]:
                  - img [ref=e319]
              - listitem [ref=e322]:
                - generic [ref=e323]: Fabiana Oliveira Silva de Almeida Carvalho
                - button "Remover Fabiana Oliveira Silva de Almeida Carvalho" [ref=e324]:
                  - img [ref=e325]
              - listitem [ref=e328]:
                - generic [ref=e329]: Daniela dos Santos chmurzynski
                - button "Remover Daniela dos Santos chmurzynski" [ref=e330]:
                  - img [ref=e331]
              - listitem [ref=e334]:
                - generic [ref=e335]: Marisélia dos Santos Costa
                - button "Remover Marisélia dos Santos Costa" [ref=e336]:
                  - img [ref=e337]
              - listitem [ref=e340]:
                - generic [ref=e341]: Ana Jocélia de Sousa Vergara
                - button "Remover Ana Jocélia de Sousa Vergara" [ref=e342]:
                  - img [ref=e343]
              - listitem [ref=e346]:
                - generic [ref=e347]: Stella da Costa
                - button "Remover Stella da Costa" [ref=e348]:
                  - img [ref=e349]
              - listitem [ref=e352]:
                - generic [ref=e353]: Luanna Lopes da Silva
                - button "Remover Luanna Lopes da Silva" [ref=e354]:
                  - img [ref=e355]
              - listitem [ref=e358]:
                - generic [ref=e359]: Érica Coêlho de Sá Rufino
                - button "Remover Érica Coêlho de Sá Rufino" [ref=e360]:
                  - img [ref=e361]
              - listitem [ref=e364]:
                - generic [ref=e365]: Cândida Silvestre
                - button "Remover Cândida Silvestre" [ref=e366]:
                  - img [ref=e367]
              - listitem [ref=e370]:
                - generic [ref=e371]: RIANA ANTUNES DA SILVA
                - button "Remover RIANA ANTUNES DA SILVA" [ref=e372]:
                  - img [ref=e373]
          - complementary [ref=e377]:
            - paragraph [ref=e381]: O momento aguarda revelação.
            - generic [ref=e384]:
              - generic [ref=e385]:
                - heading "Prêmios do Mês" [level=2] [ref=e386]
                - list [ref=e387]:
                  - listitem [ref=e388]:
                    - img [ref=e389]
                    - generic [ref=e393]: Nosso livro de maio!
                - paragraph [ref=e394]: "Destaque atual: Nosso livro de maio!"
              - heading "Últimas Ganhadoras" [level=2] [ref=e396]
              - paragraph [ref=e397]: Sem memórias recentes por aqui.
    - contentinfo [ref=e399]:
      - generic [ref=e400]:
        - generic [ref=e401]:
          - generic [ref=e402]:
            - generic [ref=e403]:
              - img "Logo Clube das Leitoras" [ref=e405]
              - generic [ref=e407]: Clube das Leitoras
            - paragraph [ref=e408]: "\"Uma comunidade feminina em Brasília, ocupando espaços e cafés com o poder das páginas.\""
          - generic [ref=e409]:
            - heading "Nossa Sede" [level=3] [ref=e410]:
              - img [ref=e411]
              - text: Nossa Sede
            - generic [ref=e414]:
              - paragraph [ref=e415]: Biblioteca Nacional de Brasília
              - paragraph [ref=e416]: Setor Cultural Sul, Lote 2
              - paragraph [ref=e417]: Brasília - DF
          - generic [ref=e418]:
            - heading "Explorar" [level=3] [ref=e419]
            - list [ref=e420]:
              - listitem [ref=e421]:
                - link "Livros do Mês" [ref=e422] [cursor=pointer]:
                  - /url: /livro-do-mes
                  - text: Livros do Mês
                  - img [ref=e423]
              - listitem [ref=e426]:
                - link "Dicas da Gabi" [ref=e427] [cursor=pointer]:
                  - /url: /dicas
              - listitem [ref=e428]:
                - link "Nossas Parcerias" [ref=e429] [cursor=pointer]:
                  - /url: /parcerias
              - listitem [ref=e430]:
                - link "Empreendedoras" [ref=e431] [cursor=pointer]:
                  - /url: /empreendedoras
                  - img [ref=e432]
                  - text: Empreendedoras
              - listitem [ref=e434]:
                - link "Política de Privacidade" [ref=e435] [cursor=pointer]:
                  - /url: /privacidade
          - generic [ref=e436]:
            - heading "Social Club" [level=3] [ref=e437]
            - generic [ref=e438]:
              - link [ref=e439] [cursor=pointer]:
                - /url: https://instagram.com/elaeasviagens
                - img [ref=e440]
              - link [ref=e443] [cursor=pointer]:
                - /url: mailto:clubedasleitorasbsb@gmail.com
                - img [ref=e444]
            - generic [ref=e447]:
              - img [ref=e448]
              - paragraph [ref=e450]: Brasília, 2026 • Ano II
        - generic [ref=e451]:
          - paragraph [ref=e452]:
            - text: © 2026 Clube das Leitoras
            - img [ref=e453]
            - text: Brasília • DF
          - generic [ref=e455]:
            - text: Feito com
            - img [ref=e456]
            - link "Kleuvyn" [ref=e458] [cursor=pointer]:
              - /url: https://portfolio.kleuvyn.tec.br
    - region "Notifications alt+T":
      - list:
        - listitem [ref=e459]:
          - img [ref=e461]
          - generic [ref=e464]: Adicionada à urna com sucesso!
  - button "Open Next.js Dev Tools" [ref=e470] [cursor=pointer]:
    - generic [ref=e473]:
      - text: Compiling
      - generic [ref=e474]:
        - generic [ref=e475]: .
        - generic [ref=e476]: .
        - generic [ref=e477]: .
  - alert [ref=e478]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test('sorteios page loads and allows adding a participant', async ({ page }) => {
  4   |   await page.goto('/sorteios');
  5   |   await expect(page).toHaveTitle(/Clube das Leitoras/i);
  6   | 
  7   |   const participanteNome = `Playwright Test ${Date.now()}`;
  8   | 
  9   |   const nomeInput = page.locator('input[aria-label="Digite seu nome"]');
  10  |   const submitButton = page.locator('button', { hasText: 'Depositar Nome' });
  11  | 
  12  |   await expect(nomeInput).toBeVisible();
  13  |   await nomeInput.fill(participanteNome);
  14  |   await Promise.all([
  15  |     page.waitForResponse((response) => response.url().endsWith('/api/sorteios') && response.request().method() === 'POST'),
  16  |     submitButton.click(),
  17  |   ]);
  18  | 
  19  |   await expect(page.locator(`text=${participanteNome}`)).toBeVisible({ timeout: 5000 });
  20  | });
  21  | 
  22  | test('sorteios page performs a full draw after adding a participant', async ({ page }) => {
  23  |   await page.goto('/sorteios');
  24  |   await expect(page).toHaveTitle(/Clube das Leitoras/i);
  25  | 
  26  |   const participanteNome = `Playwright Sortear ${Date.now()}`;
  27  | 
  28  |   await page.fill('input[aria-label="Digite seu nome"]', participanteNome);
  29  |   await page.click('button:has-text("Depositar Nome")');
  30  |   await expect(page.locator(`text=${participanteNome}`)).toBeVisible({ timeout: 5000 });
  31  | 
  32  |   await Promise.all([
> 33  |     page.waitForResponse((response) => response.url().endsWith('/api/sorteios') && response.request().method() === 'POST'),
      |          ^ Error: page.waitForResponse: Test timeout of 30000ms exceeded.
  34  |     page.click('button:has-text("Sortear Agora")'),
  35  |   ]);
  36  | 
  37  |   await expect(page.locator('text=Parabéns,')).toBeVisible({ timeout: 12000 });
  38  |   await expect(page.locator('text=Uma nova página se inicia')).toBeVisible({ timeout: 12000 });
  39  | });
  40  | 
  41  | test('sorteios page accepts the full participant list and shows the new entries', async ({ page, request }) => {
  42  |   test.setTimeout(240000);
  43  | 
  44  |   const nomes = [
  45  |     'Livea Chefer',
  46  |     'Neli Rocha',
  47  |     'Luanna Lopes',
  48  |     'Flávia Melo',
  49  |     'Carla Moraes Marinho',
  50  |     'Bruna Almeida',
  51  |     'Lydia Queiroz',
  52  |     'Diana Lisbôa Dias',
  53  |     'Luciana Leonel',
  54  |     'Mirella Vieira',
  55  |     'Haianne Thompson',
  56  |     'Barbara Bernardes',
  57  |     'Kênia Lopes',
  58  |     'Milena Mello Rocha',
  59  |     'maria eduarda zanella',
  60  |     'Eliza Pontes',
  61  |     'Sarah Sampaio',
  62  |     'Marília Fernandes',
  63  |     'Ana Júlia Pereira Gonçalves',
  64  |     'Ana Cláudia Pereira Gonçalves',
  65  |     'Thais Farias',
  66  |     'Juliana Mota',
  67  |     'Layane Alves',
  68  |     'Estela Meira',
  69  |     'Amanda pires melo dos santos',
  70  |     'Isabela Mark',
  71  |     'Mariele Freitas',
  72  |     'Thamires Gonçalves',
  73  |     'Luciana Harumi Morimoto Figueiredo',
  74  |     'Maria Isabel Ribeiro Lopes',
  75  |     'Júlia Holanda',
  76  |     'Tereza Cristina',
  77  |     'Alessandra Viana Natividade Oliveira',
  78  |     'Rafaela de Oliveira Conceição',
  79  |     'Ana Vergara',
  80  |     'Mariana Galvão',
  81  |     'Gabriella Santiago',
  82  |     'Viviane Sousa',
  83  |     'Ana Beatriz G',
  84  |     'Ana Gabriela Miranda',
  85  |     'Ana Gabriela Medrado Ribeiro',
  86  |     'Belle Guimarães',
  87  |     'June Alves',
  88  |     'Mayara Peres',
  89  |     'Érica Rufino',
  90  |     'Liana',
  91  |     'Ana Lima 🍋‍🟩',
  92  |     'Denise Andrade',
  93  |     'Angela Carmen Lima Rios',
  94  |     'Wendy Rebeca',
  95  |     'Raquel Monteiro',
  96  |     'Tainara Santos',
  97  |     'Bianca Arruda',
  98  |     'Mari Costa',
  99  |     'Mirian Lopes',
  100 |     'Carla Leoncÿ',
  101 |     'Mariana Mello Machado',
  102 |     'Leandra Camapum',
  103 |     'Lana Lopes',
  104 |     'Renata Silva',
  105 |     'Maryelly Sousa',
  106 |     'Lecy Carmona',
  107 |     'Lysian Carvalho',
  108 |     'Cristiane Calixto',
  109 |     'Ludmila Vieira',
  110 |     'Estela Silva',
  111 |     'Loise Rodrigues',
  112 |     'Stella da Costa',
  113 |     'Carla Garcia',
  114 |     'Karine Barbosa',
  115 |     'Ana Carolina Souza',
  116 |     'Leila Viana Queiroz',
  117 |     'valdeluce Amaral',
  118 |     'Leonora Pedrosa',
  119 |     'Samila Araújo',
  120 |     'Kamilla Vale',
  121 |     'Izabella Gobbi',
  122 |     'Vanessa Gonçalves',
  123 |     'Carol Mazeto',
  124 |     'Roberta Reis',
  125 |     'Adna Victoria',
  126 |     'Cândida Silvestre',
  127 |     'Eulimar Dias',
  128 |     'Suelene Vale',
  129 |     'Rafaela de Andrade',
  130 |     'Flávia Queiroz',
  131 |     'Roberta Rangel',
  132 |     'Pamela Dayane',
  133 |     'Valéria Maria Gomez Barros',
```