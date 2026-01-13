export const products = [
    // DESAYUNOS
    { id: 101, name: 'Huevos Revueltos', price: 100, category: 'Desayunos', image: '/images/breakfast.png' },
    { id: 102, name: 'Huevos a la Mexicana', price: 100, category: 'Desayunos', image: '/images/breakfast.png' },
    { id: 103, name: 'Omelette (Ingrediente a elección)', price: 115, category: 'Desayunos', image: '/images/breakfast.png' },
    { id: 104, name: 'Chilaquiles Sencillos', price: 90, category: 'Desayunos', image: '/images/breakfast.png' },
    { id: 105, name: 'Chilaquiles con Pollo', price: 115, category: 'Desayunos', image: '/images/breakfast.png' },
    { id: 106, name: 'Chilaquiles con Asada', price: 120, category: 'Desayunos', image: '/images/breakfast.png' },

    // ENTRADAS
    { id: 201, name: 'Guacamole', price: 90, category: 'Entradas', image: '/images/appetizer.png' },
    { id: 202, name: 'Papas Gajo', price: 70, category: 'Entradas', image: '/images/appetizer.png' },
    { id: 203, name: 'Papas Gajo Gratinadas', price: 90, category: 'Entradas', image: '/images/appetizer.png' },

    // ASADA Y ARRACHERA
    { id: 301, name: 'Orden Asada', price: 170, category: 'Asada y Arrachera', image: '/images/tacos.png' },
    { id: 302, name: 'Taco Asada', price: 35, category: 'Asada y Arrachera', image: '/images/tacos.png' },
    { id: 303, name: 'Quesadilla con Asada', price: 100, category: 'Asada y Arrachera', image: '/images/tacos.png' },
    { id: 304, name: 'Sincronizada de Asada', price: 140, category: 'Asada y Arrachera', image: '/images/tacos.png' },
    { id: 305, name: 'Mollete de Asada', price: 55, category: 'Asada y Arrachera', image: '/images/tacos.png' },
    { id: 306, name: 'Taco de Arrachera', price: 45, category: 'Asada y Arrachera', image: '/images/tacos.png' },
    { id: 307, name: 'Quesadilla de Arrachera', price: 120, category: 'Asada y Arrachera', image: '/images/tacos.png' },
    { id: 308, name: 'Papa Norteña Asada', price: 150, category: 'Asada y Arrachera', image: '/images/tacos.png' },
    { id: 309, name: 'Hamburguesa Arrachera', price: 150, category: 'Asada y Arrachera', image: '/images/burger.png' },
    { id: 310, name: 'Hamburguesa Doble Arrachera', price: 200, category: 'Asada y Arrachera', image: '/images/burger.png' },
    { id: 311, name: 'Burrito', price: 120, category: 'Asada y Arrachera', image: '/images/tacos.png' },

    // ANTOJITOS MEXICANOS
    { id: 401, name: 'Tostada Lomo Deshebrado', price: 75, category: 'Antojitos Mexicanos', image: '/images/tacos.png' },
    { id: 402, name: 'Flautas de Pollo (4)', price: 60, category: 'Antojitos Mexicanos', image: '/images/tacos.png' },
    { id: 403, name: 'Sopitos (4)', price: 60, category: 'Antojitos Mexicanos', image: '/images/tacos.png' },
    { id: 404, name: 'Tacos Dorados de Lomo (4)', price: 60, category: 'Antojitos Mexicanos', image: '/images/tacos.png' },
    { id: 405, name: 'Enfrijoladas (4)', price: 65, category: 'Antojitos Mexicanos', image: '/images/tacos.png' },
    { id: 406, name: 'Enchiladas Dulces/Saladas (4)', price: 65, category: 'Antojitos Mexicanos', image: '/images/tacos.png' },
    { id: 407, name: 'Sope Gordo Lomo', price: 60, category: 'Antojitos Mexicanos', image: '/images/tacos.png' },

    // GUISADOS
    { id: 501, name: 'Chamorro en Tatemado', price: 100, category: 'Guisados', image: '/images/lasagna.png' },
    { id: 502, name: 'Costilla en Salsa Verde', price: 110, category: 'Guisados', image: '/images/lasagna.png' },
    { id: 503, name: 'Pollo en Mole', price: 100, category: 'Guisados', image: '/images/lasagna.png' },
    { id: 504, name: 'Filete de Pollo Empanizado', price: 110, category: 'Guisados', image: '/images/lasagna.png' },
    { id: 505, name: 'Albóndigas', price: 110, category: 'Guisados', image: '/images/lasagna.png' },

    // OTROS
    { id: 601, name: 'Hamburguesa Sencilla', price: 90, category: 'Otros', image: '/images/burger.png' },
    { id: 602, name: 'Hamburguesa Especial', price: 110, category: 'Otros', image: '/images/burger.png' },
    { id: 603, name: 'Club Sandwich', price: 70, category: 'Otros', image: '/images/burger.png' },
    { id: 604, name: 'Torta Lomo Natural', price: 70, category: 'Otros', image: '/images/burger.png' },
    { id: 605, name: 'Torta de Asada', price: 85, category: 'Otros', image: '/images/burger.png' },

    // BEBIDAS
    { id: 701, name: 'Agua Fresca (Litro)', price: 35, category: 'Bebidas', image: '/images/coke.png' },
    { id: 702, name: 'Refresco 355ml', price: 35, category: 'Bebidas', image: '/images/coke.png' },
    { id: 703, name: 'Cerveza Corona', price: 35, category: 'Bebidas', image: '/images/coke.png' },
    { id: 704, name: 'Cerveza Victoria', price: 35, category: 'Bebidas', image: '/images/coke.png' },
    { id: 705, name: 'Cerveza Michelob Ultra', price: 38, category: 'Bebidas', image: '/images/coke.png' },
    { id: 706, name: 'Frappuccino Clásico', price: 50, category: 'Bebidas', image: '/images/coke.png' },
    { id: 707, name: 'Agua Mineral 600ml', price: 30, category: 'Bebidas', image: '/images/coke.png' },
    { id: 708, name: 'Bacardi 750ml', price: 400, category: 'Bebidas', image: '/images/coke.png' }
];
