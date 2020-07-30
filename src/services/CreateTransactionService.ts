import { getRepository } from 'typeorm';

// import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);

    let category = await categoriesRepository.findOne({
      where: {
        title: categoryTitle,
      },
    });

    if (!category) {
      category = await categoriesRepository.create({
        title: categoryTitle,
      });

      await categoriesRepository.save(category);
    }

    const transactionsRepository = getRepository(Transaction);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
