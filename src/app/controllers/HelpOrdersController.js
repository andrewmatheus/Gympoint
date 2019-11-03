import * as Yup from 'yup';
import Order from '../schemas/HelpOrders';
import Student from '../models/Student';

class HelpOrdersController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const order = await Order.create({
      student_id: student.id,
      question: req.body.question,
    });

    return res.json(order);
  }

  async index(req, res) {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const order = await Order.find({
      student_id: student.id,
    });

    return res.json(order);
  }
}

export default new HelpOrdersController();
