import { OrdersRepository } from '../modules/repository/services/orders.repository';




export async function getManagerOrderStats(
  ordersRepository: OrdersRepository,
  managerId: string,
): Promise<Record<string, number>> {
  const rawStats = await ordersRepository
    .createQueryBuilder('order')
    .select('order.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .where('order.manager_id = :managerId', { managerId })
    .groupBy('order.status')
    .getRawMany();

  const stats: Record<string, number> = {};
  rawStats.forEach(row => {
    stats[row.status] = Number(row.count);
  });

  return stats;
}
