import { test, expect } from '@playwright/test';

test('sorteios page loads and allows adding a participant', async ({ page }) => {
  await page.goto('/sorteios');
  await expect(page).toHaveTitle(/Clube das Leitoras/i);

  const participanteNome = `Playwright Test ${Date.now()}`;

  const nomeInput = page.locator('input[aria-label="Digite seu nome"]');
  const submitButton = page.locator('button', { hasText: 'Depositar Nome' });

  await expect(nomeInput).toBeVisible();
  await nomeInput.fill(participanteNome);
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/api/sorteios') && response.request().method() === 'POST'),
    submitButton.click(),
  ]);

  await expect(page.locator(`text=${participanteNome}`)).toBeVisible({ timeout: 5000 });
});

test('sorteios page performs a full draw after adding a participant', async ({ page }) => {
  await page.goto('/sorteios');
  await expect(page).toHaveTitle(/Clube das Leitoras/i);

  const participanteNome = `Playwright Sortear ${Date.now()}`;

  await page.fill('input[aria-label="Digite seu nome"]', participanteNome);
  await page.click('button:has-text("Depositar Nome")');
  await expect(page.locator(`text=${participanteNome}`)).toBeVisible({ timeout: 5000 });

  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/api/sorteios') && response.request().method() === 'POST'),
    page.click('button:has-text("Sortear Agora")'),
  ]);

  await expect(page.locator('text=Parabéns,')).toBeVisible({ timeout: 12000 });
  await expect(page.locator('text=Uma nova página se inicia')).toBeVisible({ timeout: 12000 });
});

test('sorteios page accepts the full participant list and shows the new entries', async ({ page, request }) => {
  test.setTimeout(240000);

  const nomes = [
    'Livea Chefer',
    'Neli Rocha',
    'Luanna Lopes',
    'Flávia Melo',
    'Carla Moraes Marinho',
    'Bruna Almeida',
    'Lydia Queiroz',
    'Diana Lisbôa Dias',
    'Luciana Leonel',
    'Mirella Vieira',
    'Haianne Thompson',
    'Barbara Bernardes',
    'Kênia Lopes',
    'Milena Mello Rocha',
    'maria eduarda zanella',
    'Eliza Pontes',
    'Sarah Sampaio',
    'Marília Fernandes',
    'Ana Júlia Pereira Gonçalves',
    'Ana Cláudia Pereira Gonçalves',
    'Thais Farias',
    'Juliana Mota',
    'Layane Alves',
    'Estela Meira',
    'Amanda pires melo dos santos',
    'Isabela Mark',
    'Mariele Freitas',
    'Thamires Gonçalves',
    'Luciana Harumi Morimoto Figueiredo',
    'Maria Isabel Ribeiro Lopes',
    'Júlia Holanda',
    'Tereza Cristina',
    'Alessandra Viana Natividade Oliveira',
    'Rafaela de Oliveira Conceição',
    'Ana Vergara',
    'Mariana Galvão',
    'Gabriella Santiago',
    'Viviane Sousa',
    'Ana Beatriz G',
    'Ana Gabriela Miranda',
    'Ana Gabriela Medrado Ribeiro',
    'Belle Guimarães',
    'June Alves',
    'Mayara Peres',
    'Érica Rufino',
    'Liana',
    'Ana Lima 🍋‍🟩',
    'Denise Andrade',
    'Angela Carmen Lima Rios',
    'Wendy Rebeca',
    'Raquel Monteiro',
    'Tainara Santos',
    'Bianca Arruda',
    'Mari Costa',
    'Mirian Lopes',
    'Carla Leoncÿ',
    'Mariana Mello Machado',
    'Leandra Camapum',
    'Lana Lopes',
    'Renata Silva',
    'Maryelly Sousa',
    'Lecy Carmona',
    'Lysian Carvalho',
    'Cristiane Calixto',
    'Ludmila Vieira',
    'Estela Silva',
    'Loise Rodrigues',
    'Stella da Costa',
    'Carla Garcia',
    'Karine Barbosa',
    'Ana Carolina Souza',
    'Leila Viana Queiroz',
    'valdeluce Amaral',
    'Leonora Pedrosa',
    'Samila Araújo',
    'Kamilla Vale',
    'Izabella Gobbi',
    'Vanessa Gonçalves',
    'Carol Mazeto',
    'Roberta Reis',
    'Adna Victoria',
    'Cândida Silvestre',
    'Eulimar Dias',
    'Suelene Vale',
    'Rafaela de Andrade',
    'Flávia Queiroz',
    'Roberta Rangel',
    'Pamela Dayane',
    'Valéria Maria Gomez Barros',
    'Fernanda Godoi',
    'Anna Abreu',
    'Clara Duarte',
    'Vanessa Tenório',
    'Verlucia Amaro',
    'Sonivalda',
    'Thaise Kemer',
    'Janaína Amaro',
    'Cecília Katarina Gomes Araújo',
    'Alana Pimenta',
    'Jacqueline Vidal',
    'Louvane da Conceição Ferreira',
    'Stephanie Kaline',
    'Martielle Prates',
    'Leonice França',
    'Maria Cecília Veloso',
    'Andrea Ribeiro',
    'Silene Paiva',
    'Carol Fonsêca',
    'Thalia Alessandra',
    'Helena Sayuri',
    'Adriana Izel',
    'Maria Guerra',
    'Dienner Mory',
    'Andréia Almeida',
    'Raquel Barros',
    'Karina Lebre',
    'Verônica Prometeu',
    'Fabiana Rocha Machado de Almeida',
    'Lisys Carvalho Castilho',
    'Rita de Cássia',
    'Elaine Brito',
    'Lory Caldas',
    'Rejane Melo',
    'Vivianne Eilers',
    'Fabiana Almeida',
    'Duanne Mendes',
    'Giselle Santos',
    'Thaís de Souza Abreu',
    'Beatriz Garcia',
    'Andrea Suzana Grings',
    'Fabiany Glaura',
    'Ana Cecília',
    'Ayde Guedes',
    'Luciana Vieira',
    'Ana Elisa De F Souza',
    'Thaiane Sena',
    'Gleicianne Fernandes',
    'Thaiane Mayara',
    'Andreia Castro',
    'Luciana Dutra',
    'Mônica Maia',
    'Tarciana Fortaleza',
    'Maria Irani',
    'Daniela dos Santos',
    'Vitória Ramos',
    'Cristiane Lemos',
    'Giselle Gomes',
    'Ana Júlia Rodrigues',
    'Flávia Paiva',
    'Loiany Galeno',
    'Maria Carolina Costa',
    'Fernanda Tkatsch',
    'Renata Siqueira Reis',
    'Lívia Viana',
    'Lívia Barros',
    'Luciana Bezerra',
    'Luana Gomes',
    'Flavia Silva',
    'Larissa C. Oliveira',
    'Auristela Andrade',
    'Grasiele Lima',
    'Danielle Paiva',
    'Karoline Silva',
    'Cristiane Ferreira',
    'Natasha Fazolo',
    'Barbara Vania',
    'Heloísa Lange',
    'Milena Oliveira',
    'Kate Elen Silvério',
    'Ana Luiza de Melo Souza',
    'Amanda Marto',
    'Andréia Lima',
    'Bethyzabel',
    'Maria Elisabete Szervinsk',
    'Gerliane',
    'Kelly Melo',
    'Ingrid Moura',
    'Karina Lima',
    'Yoná',
    'Mariana Menezes Souza',
    'Rizia de Lima',
    'Lissandra Martins Souza',
    'Daniella Gama',
    'Lindalva Matos',
    'Vanessa Eilers',
    'Kênia Cardoso',
    'Nathália Oliveira',
    'Gabriela Reis',
    'Giulia Fernandes',
    'Luciana Nascimento',
    'Juliana Koetz',
    'Maria Antônia Barbosa',
    'Flávia Serrano Belo',
    'Julianna Curado',
    'Paula monteiro de castro nessimian',
    'Luinny',
    'Natalia Cavallieri',
    'Clarice Andrade',
    'Helia Lemos',
    'Cíntia Ferraz',
    'Fabíola da Conceição Ferreira',
    'Ana Carolina Macedo Lübcke',
    'Diana Carvalho',
    'Alessandra Avila Correia',
    'Nícia Morgado Clerot',
  ];

  const now = new Date();
  const mesBase = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const chunkSize = 5;
  for (let i = 0; i < nomes.length; i += chunkSize) {
    const chunk = nomes.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async (nome) => {
      const response = await request.post('/api/sorteios', {
        data: {
          action: 'addParticipante',
          payload: { nome, mesBase },
        },
      });
      expect(response.ok()).toBeTruthy();
    }));
  }

  await page.goto('/sorteios');
  await expect(page.locator('text=Livea Chefer').first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('text=Nícia Morgado Clerot').first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('text=Bianca Arruda').first()).toBeVisible({ timeout: 15000 });
});
