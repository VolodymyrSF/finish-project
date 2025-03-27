import * as ExcelJS from 'exceljs';
import { OrderEntity } from '../database/entities/orders.entity';
import { Response } from 'express';

export async function exportOrdersToExcel(orders: any[], res: Response) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Ім’я', key: 'name', width: 20 },
    { header: 'Прізвище', key: 'surname', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Телефон', key: 'phone', width: 20 },
    { header: 'Вік', key: 'age', width: 10 },
    { header: 'Курс', key: 'course', width: 15 },
    { header: 'Формат курсу', key: 'course_format', width: 15 },
    { header: 'Тип курсу', key: 'course_type', width: 15 },
    { header: 'Статус', key: 'status', width: 15 },
    { header: 'Сума', key: 'sum', width: 15 },
    { header: 'Вже оплачено', key: 'alreadyPaid', width: 15 },
    { header: 'Дата створення', key: 'created_at', width: 20 },
    { header: 'Повідомлення', key: 'msg', width: 30 },
    { header: 'UTM', key: 'utm', width: 30 },
    { header: 'Коментарі', key: 'comments', width: 30 },
    { header: 'Менеджер', key: 'manager', width: 20 },
    { header: 'Група', key: 'group', width: 20 },
  ];

  orders.forEach(order => {
    const commentsFormatted = order.comments
      ? order.comments.map(comment => `${comment.text} (by ${comment.author}, on ${new Date(comment.createdAt).toLocaleString()})`).join('\n')
      : '';

    worksheet.addRow({
      id: order.id,
      name: order.name || '',
      surname: order.surname || '',
      email: order.email || '',
      phone: order.phone || '',
      age: order.age || '',
      course: order.course || '',
      course_format: order.course_format || '',
      course_type: order.course_type || '',
      status: order.status || '',
      sum: order.sum !== null ? order.sum : '',
      alreadyPaid: order.alreadyPaid !== null ? order.alreadyPaid : '',
      created_at: order.created_at ? new Date(order.created_at).toLocaleString() : '',
      msg: order.msg || '',
      utm: order.utm || '',
      comments: commentsFormatted,
      manager: order.manager ? order.manager.name : '',
      group: order.group ? order.group.name : '',
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

  await workbook.xlsx.write(res);
  res.end();
}
