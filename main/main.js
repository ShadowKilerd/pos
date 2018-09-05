const { loadAllItems, loadPromotions } = require('./datbase');

const loadAllFormatedItems = () => loadAllItems().reduce((items, item) => {
  items[item.barcode] = item;
  return items;
}, {});

const barcodeParser = (input) => {
  const [barcode, quantity = 1] = input.split('-');
  return { barcode, quantity: parseInt(quantity, 10) };
};

const shoppingCartPrinter = (cart) => {
  const stringBuilder = [];

  const ItemsPrintInformation = Object.values(cart.items).map(item => `名称：${item.item.name}，数量：${item.quantity}${item.item.unit}，单价：${item.item.price.toFixed(2)}(元)，小计：${(item.item.price * (item.discountQuantity || item.quantity)).toFixed(2)}(元)`);

  const PromotionalItemsInformation = Object.values(cart.promotions).map(item => `名称：${item.item.name}，数量：${item.quantity}${item.item.unit}`);
  stringBuilder.push('***<没钱赚商店>购物清单***');
  stringBuilder.push(...ItemsPrintInformation);
  stringBuilder.push('----------------------');
  stringBuilder.push('挥泪赠送商品：');
  stringBuilder.push(...PromotionalItemsInformation);
  stringBuilder.push('----------------------');
  stringBuilder.push(`总计：${cart.total.toFixed(2)}(元)`);
  stringBuilder.push(`节省：${cart.discount.toFixed(2)}(元)`);
  stringBuilder.push('**********************');

  return stringBuilder.join('\n');
};


const printInventory = (input) => {
  const allItems = loadAllFormatedItems();
  const allPromotions = loadPromotions();

  const shoppingCart = input.map(barcodeParser).reduce((info, item) => {
    if (info.items[item.barcode]) {
      info.items[item.barcode].quantity += item.quantity;
    } else {
      info.items[item.barcode] = {
        item: allItems[item.barcode],
        quantity: (info.items[item.barcode] || 0) + item.quantity,
      };
    }
    return info;
  }, { items: {}, promotions: {} });

  Object.keys(shoppingCart.items).forEach((itemBarcode) => {
    if (allPromotions[0].barcodes.includes(itemBarcode)) {
      const promotionalItemInformation = {
        item: allItems[itemBarcode],
        quantity: Math.floor(shoppingCart.items[itemBarcode].quantity / 3),
      };
      shoppingCart.promotions[itemBarcode] = promotionalItemInformation;
      shoppingCart.items[itemBarcode].discountQuantity = shoppingCart.items[itemBarcode].quantity - promotionalItemInformation.quantity;
    }
  });

  shoppingCart.total = Object.values(shoppingCart.items).reduce((sum, item) => {
    sum += item.item.price * (item.discountQuantity || item.quantity);
    return sum;
  }, 0);

  shoppingCart.discount = Object.values(shoppingCart.promotions).reduce((sum, item) => {
      sum += item.item.price * item.quantity;
      return sum;
  }, 0);


  console.log(shoppingCartPrinter(shoppingCart));
};

function main() {
  console.log('Debug Info');
  return 'Hello World!';
}


module.exports = {
  main, printInventory,
};
