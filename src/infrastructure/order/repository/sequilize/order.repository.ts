import Order from "../../../../domain/checkout/entity/order";
import OrderItem from '../../../../domain/checkout/entity/order_item';
import OrderRepositoryInterface from '../../../../domain/checkout/repository/order-repository.interface';
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        total: entity.total(),
        customer_id: entity.customerId,
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        where: {
          id: entity.id,
        },
      }
    );
  }

  async find(id: string): Promise<Order> {
    const order = await OrderModel.findOne({
      where: { id },
      include: ["items"],
    });
    const list: OrderItem[] = [];
    order.items.map((item) => {
      let i = new OrderItem(
        item.id,
        item.name,
        item.price,
        item.product_id,
        item.quantity
      );
      list.push(i);
    });
    return new Order(order.id, order.customer_id, list);
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({ include: [OrderItemModel] });
    const orders = orderModels.map((orderModel) => {
      const list: OrderItem[] = [];
      orderModel.items.map((item) => {
        let i = new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        );
        list.push(i);
      });
      return new Order(orderModel.id, orderModel.customer_id, list);
    });

    return orders;
  }
}
