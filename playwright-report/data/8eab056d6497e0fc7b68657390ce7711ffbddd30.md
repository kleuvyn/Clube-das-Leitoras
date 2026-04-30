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
              - generic [ref=e49]: 58 nomes
            - list [ref=e51]:
              - listitem [ref=e52]:
                - generic [ref=e53]: Playwright Test 1777554810829
                - button "Remover Playwright Test 1777554810829" [ref=e54]:
                  - img [ref=e55]
              - listitem [ref=e61]:
                - generic [ref=e62]: Playwright Sortear 1777554810704
                - button "Remover Playwright Sortear 1777554810704" [ref=e63]:
                  - img [ref=e64]
              - listitem [ref=e70]:
                - generic [ref=e71]: Playwright Test 1777554810162
                - button "Remover Playwright Test 1777554810162" [ref=e72]:
                  - img [ref=e73]
              - listitem [ref=e79]:
                - generic [ref=e80]: Playwright Sortear 1777554810189
                - button "Remover Playwright Sortear 1777554810189" [ref=e81]:
                  - img [ref=e82]
              - listitem [ref=e88]:
                - generic [ref=e89]: Kate Elen Silvério Lopes
                - button "Remover Kate Elen Silvério Lopes" [ref=e90]:
                  - img [ref=e91]
              - listitem [ref=e97]:
                - generic [ref=e98]: Débora Alves Pereira
                - button "Remover Débora Alves Pereira" [ref=e99]:
                  - img [ref=e100]
              - listitem [ref=e106]:
                - generic [ref=e107]: Denise Gonzalez
                - button "Remover Denise Gonzalez" [ref=e108]:
                  - img [ref=e109]
              - listitem [ref=e115]:
                - generic [ref=e116]: Mariana Coutinho
                - button "Remover Mariana Coutinho" [ref=e117]:
                  - img [ref=e118]
              - listitem [ref=e124]:
                - generic [ref=e125]: Raquel Barros
                - button "Remover Raquel Barros" [ref=e126]:
                  - img [ref=e127]
              - listitem [ref=e133]:
                - generic [ref=e134]: Flávia Araujo de Melo
                - button "Remover Flávia Araujo de Melo" [ref=e135]:
                  - img [ref=e136]
              - listitem [ref=e142]:
                - generic [ref=e143]: Milena Mello Rocha
                - button "Remover Milena Mello Rocha" [ref=e144]:
                  - img [ref=e145]
              - listitem [ref=e151]:
                - generic [ref=e152]: Alessandra Avila Correia
                - button "Remover Alessandra Avila Correia" [ref=e153]:
                  - img [ref=e154]
              - listitem [ref=e160]:
                - generic [ref=e161]: Estela Meira Maciel
                - button "Remover Estela Meira Maciel" [ref=e162]:
                  - img [ref=e163]
              - listitem [ref=e169]:
                - generic [ref=e170]: Michelli Lopes
                - button "Remover Michelli Lopes" [ref=e171]:
                  - img [ref=e172]
              - listitem [ref=e178]:
                - generic [ref=e179]: Vivianne Eilers
                - button "Remover Vivianne Eilers" [ref=e180]:
                  - img [ref=e181]
              - listitem [ref=e187]:
                - generic [ref=e188]: Loise Rodriguez
                - button "Remover Loise Rodriguez" [ref=e189]:
                  - img [ref=e190]
              - listitem [ref=e196]:
                - generic [ref=e197]: Karine Barbosa da Silva
                - button "Remover Karine Barbosa da Silva" [ref=e198]:
                  - img [ref=e199]
              - listitem [ref=e205]:
                - generic [ref=e206]: Ana Carolina Barbosa de Souza
                - button "Remover Ana Carolina Barbosa de Souza" [ref=e207]:
                  - img [ref=e208]
              - listitem [ref=e214]:
                - generic [ref=e215]: Nayra Priscila Guedes dos Santos
                - button "Remover Nayra Priscila Guedes dos Santos" [ref=e216]:
                  - img [ref=e217]
              - listitem [ref=e223]:
                - generic [ref=e224]: Diana Lisbôa Dias
                - button "Remover Diana Lisbôa Dias" [ref=e225]:
                  - img [ref=e226]
              - listitem [ref=e232]:
                - generic [ref=e233]: Kelly Gomes de Melo
                - button "Remover Kelly Gomes de Melo" [ref=e234]:
                  - img [ref=e235]
              - listitem [ref=e241]:
                - generic [ref=e242]: Samila Costa de Araújo
                - button "Remover Samila Costa de Araújo" [ref=e243]:
                  - img [ref=e244]
              - listitem [ref=e250]:
                - generic [ref=e251]: ELIANE SILVA BARBOSA DE BRITO
                - button "Remover ELIANE SILVA BARBOSA DE BRITO" [ref=e252]:
                  - img [ref=e253]
              - listitem [ref=e259]:
                - generic [ref=e260]: Débora de Morais Silva Vicente
                - button "Remover Débora de Morais Silva Vicente" [ref=e261]:
                  - img [ref=e262]
              - listitem [ref=e268]:
                - generic [ref=e269]: Amanda pires melo dos santos
                - button "Remover Amanda pires melo dos santos" [ref=e270]:
                  - img [ref=e271]
              - listitem [ref=e277]:
                - generic [ref=e278]: Verlucia amaro
                - button "Remover Verlucia amaro" [ref=e279]:
                  - img [ref=e280]
              - listitem [ref=e286]:
                - generic [ref=e287]: Daniella Flores Gama Molas
                - button "Remover Daniella Flores Gama Molas" [ref=e288]:
                  - img [ref=e289]
              - listitem [ref=e295]:
                - generic [ref=e296]: Erika de Jesus
                - button "Remover Erika de Jesus" [ref=e297]:
                  - img [ref=e298]
              - listitem [ref=e304]:
                - generic [ref=e305]: Leonora Brasil Pedrosa
                - button "Remover Leonora Brasil Pedrosa" [ref=e306]:
                  - img [ref=e307]
              - listitem [ref=e313]:
                - generic [ref=e314]: Thaís de Souza Abreu Jacintho
                - button "Remover Thaís de Souza Abreu Jacintho" [ref=e315]:
                  - img [ref=e316]
              - listitem [ref=e322]:
                - generic [ref=e323]: Livea Chefer
                - button "Remover Livea Chefer" [ref=e324]:
                  - img [ref=e325]
              - listitem [ref=e331]:
                - generic [ref=e332]: Márcia Gomes
                - button "Remover Márcia Gomes" [ref=e333]:
                  - img [ref=e334]
              - listitem [ref=e340]:
                - generic [ref=e341]: Lisys Carvalho Castilho
                - button "Remover Lisys Carvalho Castilho" [ref=e342]:
                  - img [ref=e343]
              - listitem [ref=e349]:
                - generic [ref=e350]: Ana Júlia Pereira Gonçalves
                - button "Remover Ana Júlia Pereira Gonçalves" [ref=e351]:
                  - img [ref=e352]
              - listitem [ref=e358]:
                - generic [ref=e359]: Ana Cláudia Pereira Gonçalves
                - button "Remover Ana Cláudia Pereira Gonçalves" [ref=e360]:
                  - img [ref=e361]
              - listitem [ref=e367]:
                - generic [ref=e368]: Cristiane Calixto
                - button "Remover Cristiane Calixto" [ref=e369]:
                  - img [ref=e370]
              - listitem [ref=e376]:
                - generic [ref=e377]: Haianne Thompson Hussein de Cerqueira Monteiro
                - button "Remover Haianne Thompson Hussein de Cerqueira Monteiro" [ref=e378]:
                  - img [ref=e379]
              - listitem [ref=e385]:
                - generic [ref=e386]: Andrea Ferreira Ribeiro
                - button "Remover Andrea Ferreira Ribeiro" [ref=e387]:
                  - img [ref=e388]
              - listitem [ref=e394]:
                - generic [ref=e395]: Izabella Gobbi Arantes
                - button "Remover Izabella Gobbi Arantes" [ref=e396]:
                  - img [ref=e397]
              - listitem [ref=e403]:
                - generic [ref=e404]: Ana Cecília de Freitas Santos
                - button "Remover Ana Cecília de Freitas Santos" [ref=e405]:
                  - img [ref=e406]
              - listitem [ref=e412]:
                - generic [ref=e413]: Wendy Rebeca Tavares do Nascimento
                - button "Remover Wendy Rebeca Tavares do Nascimento" [ref=e414]:
                  - img [ref=e415]
              - listitem [ref=e421]:
                - generic [ref=e422]: Nathalia Braga Fayão Oliveira
                - button "Remover Nathalia Braga Fayão Oliveira" [ref=e423]:
                  - img [ref=e424]
              - listitem [ref=e430]:
                - generic [ref=e431]: Lydia Queiroz
                - button "Remover Lydia Queiroz" [ref=e432]:
                  - img [ref=e433]
              - listitem [ref=e439]:
                - generic [ref=e440]: Denise Andrade
                - button "Remover Denise Andrade" [ref=e441]:
                  - img [ref=e442]
              - listitem [ref=e448]:
                - generic [ref=e449]: Leonice França
                - button "Remover Leonice França" [ref=e450]:
                  - img [ref=e451]
              - listitem [ref=e457]:
                - generic [ref=e458]: Dryelle Oliveira Dias Leão
                - button "Remover Dryelle Oliveira Dias Leão" [ref=e459]:
                  - img [ref=e460]
              - listitem [ref=e466]:
                - generic [ref=e467]: Thais Teixeira Carvalho
                - button "Remover Thais Teixeira Carvalho" [ref=e468]:
                  - img [ref=e469]
              - listitem [ref=e475]:
                - generic [ref=e476]: Giselle Silva dos Santos
                - button "Remover Giselle Silva dos Santos" [ref=e477]:
                  - img [ref=e478]
              - listitem [ref=e484]:
                - generic [ref=e485]: Carla Leoncÿ
                - button "Remover Carla Leoncÿ" [ref=e486]:
                  - img [ref=e487]
              - listitem [ref=e493]:
                - generic [ref=e494]: Fabiana Oliveira Silva de Almeida Carvalho
                - button "Remover Fabiana Oliveira Silva de Almeida Carvalho" [ref=e495]:
                  - img [ref=e496]
              - listitem [ref=e502]:
                - generic [ref=e503]: Daniela dos Santos chmurzynski
                - button "Remover Daniela dos Santos chmurzynski" [ref=e504]:
                  - img [ref=e505]
              - listitem [ref=e511]:
                - generic [ref=e512]: Marisélia dos Santos Costa
                - button "Remover Marisélia dos Santos Costa" [ref=e513]:
                  - img [ref=e514]
              - listitem [ref=e520]:
                - generic [ref=e521]: Ana Jocélia de Sousa Vergara
                - button "Remover Ana Jocélia de Sousa Vergara" [ref=e522]:
                  - img [ref=e523]
              - listitem [ref=e529]:
                - generic [ref=e530]: Stella da Costa
                - button "Remover Stella da Costa" [ref=e531]:
                  - img [ref=e532]
              - listitem [ref=e538]:
                - generic [ref=e539]: Luanna Lopes da Silva
                - button "Remover Luanna Lopes da Silva" [ref=e540]:
                  - img [ref=e541]
              - listitem [ref=e547]:
                - generic [ref=e548]: Érica Coêlho de Sá Rufino
                - button "Remover Érica Coêlho de Sá Rufino" [ref=e549]:
                  - img [ref=e550]
              - listitem [ref=e556]:
                - generic [ref=e557]: Cândida Silvestre
                - button "Remover Cândida Silvestre" [ref=e558]:
                  - img [ref=e559]
              - listitem [ref=e565]:
                - generic [ref=e566]: RIANA ANTUNES DA SILVA
                - button "Remover RIANA ANTUNES DA SILVA" [ref=e567]:
                  - img [ref=e568]
          - complementary [ref=e575]:
            - paragraph [ref=e579]: O momento aguarda revelação.
            - generic [ref=e582]:
              - generic [ref=e583]:
                - heading "Prêmios do Mês" [level=2] [ref=e584]
                - list [ref=e585]:
                  - listitem [ref=e586]:
                    - img [ref=e587]
                    - generic [ref=e592]: Nosso livro de maio!
                - paragraph [ref=e593]: "Destaque atual: Nosso livro de maio!"
              - heading "Últimas Ganhadoras" [level=2] [ref=e595]
              - paragraph [ref=e596]: Sem memórias recentes por aqui.
    - contentinfo [ref=e598]:
      - generic [ref=e599]:
        - generic [ref=e600]:
          - generic [ref=e601]:
            - generic [ref=e602]:
              - img "Logo Clube das Leitoras" [ref=e604]
              - generic [ref=e606]: Clube das Leitoras
            - paragraph [ref=e607]: "\"Uma comunidade feminina em Brasília, ocupando espaços e cafés com o poder das páginas.\""
          - generic [ref=e608]:
            - heading "Nossa Sede" [level=3] [ref=e609]:
              - img [ref=e610]
              - text: Nossa Sede
            - generic [ref=e613]:
              - paragraph [ref=e614]: Biblioteca Nacional de Brasília
              - paragraph [ref=e615]: Setor Cultural Sul, Lote 2
              - paragraph [ref=e616]: Brasília - DF
          - generic [ref=e617]:
            - heading "Explorar" [level=3] [ref=e618]
            - list [ref=e619]:
              - listitem [ref=e620]:
                - link "Livros do Mês" [ref=e621] [cursor=pointer]:
                  - /url: /livro-do-mes
                  - text: Livros do Mês
                  - img [ref=e622]
              - listitem [ref=e625]:
                - link "Dicas da Gabi" [ref=e626] [cursor=pointer]:
                  - /url: /dicas
              - listitem [ref=e627]:
                - link "Nossas Parcerias" [ref=e628] [cursor=pointer]:
                  - /url: /parcerias
              - listitem [ref=e629]:
                - link "Empreendedoras" [ref=e630] [cursor=pointer]:
                  - /url: /empreendedoras
                  - img [ref=e631]
                  - text: Empreendedoras
              - listitem [ref=e637]:
                - link "Política de Privacidade" [ref=e638] [cursor=pointer]:
                  - /url: /privacidade
          - generic [ref=e639]:
            - heading "Social Club" [level=3] [ref=e640]
            - generic [ref=e641]:
              - link [ref=e642] [cursor=pointer]:
                - /url: https://instagram.com/elaeasviagens
                - img [ref=e643]
              - link [ref=e647] [cursor=pointer]:
                - /url: mailto:clubedasleitorasbsb@gmail.com
                - img [ref=e648]
            - generic [ref=e651]:
              - img [ref=e652]
              - paragraph [ref=e657]: Brasília, 2026 • Ano II
        - generic [ref=e658]:
          - paragraph [ref=e659]:
            - text: © 2026 Clube das Leitoras
            - img [ref=e660]
            - text: Brasília • DF
          - generic [ref=e662]:
            - text: Feito com
            - img [ref=e663]
            - link "Kleuvyn" [ref=e665] [cursor=pointer]:
              - /url: https://portfolio.kleuvyn.tec.br
    - region "Notifications alt+T":
      - list:
        - listitem [ref=e666]:
          - img [ref=e668]
          - generic [ref=e671]: Adicionada à urna com sucesso!
  - button "Open Next.js Dev Tools" [ref=e677] [cursor=pointer]:
    - generic [ref=e680]:
      - text: Compiling
      - generic [ref=e681]:
        - generic [ref=e682]: .
        - generic [ref=e683]: .
        - generic [ref=e684]: .
  - alert [ref=e685]
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