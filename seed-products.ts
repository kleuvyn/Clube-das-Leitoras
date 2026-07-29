import * as dotenv from 'dotenv';
dotenv.config();
import { dbWrite } from './lib/db';
import { produtos } from './lib/db/schema';

const initialProducts = [
  {
    name: "Livro do Mês",
    description: "A leitura escolhida pelas leitoras para o encontro do mês. Edição especial do clube.",
    price: 5490,
    imageUrl: "/images/produto-livro.png",
    category: "livros",
    badge: "Destaque",
    stock: 10,
  },
  {
    name: "Kit Clássicos da Estante",
    description: "Trio de clássicos da literatura em edições capa dura para começar sua coleção.",
    price: 12990,
    imageUrl: "/images/produto-livro.png",
    category: "livros",
    stock: 5,
  },
  {
    name: "Marcadores Botânicos",
    description: "Conjunto com 4 marcadores ilustrados com folhagens e pingentes de tassel.",
    price: 2490,
    imageUrl: "/images/produto-marcadores.png",
    category: "marcadores",
    badge: "Mais amado",
    stock: 50,
  },
  {
    name: "Ecobag Clube das Leitoras",
    description: "Sacola de algodão cru resistente com estampa botânica exclusiva do clube.",
    price: 3990,
    imageUrl: "/images/produto-ecobag.png",
    category: "ecobags",
    badge: "Novidade",
    stock: 20,
  },
  {
    name: "Caneca Café e Livro",
    description: "Caneca de cerâmica 300ml para acompanhar leituras longas com um café quentinho.",
    price: 3490,
    imageUrl: "/images/produto-xicara.png",
    category: "canecas",
    stock: 15,
  },
];

async function seedProducts() {
  console.log('Seeding products...');
  for (const p of initialProducts) {
    await dbWrite.insert(produtos).values(p);
  }
  console.log('Done!');
  process.exit(0);
}

seedProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
