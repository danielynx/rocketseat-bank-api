import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

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
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total < value) {
        throw new AppError('You do not have enough balance');
      }
    }

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

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
