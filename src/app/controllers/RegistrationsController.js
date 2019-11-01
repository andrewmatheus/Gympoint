import * as Yup from 'yup';
import { parseISO, addMonths } from 'date-fns';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';
import User from '../models/User';

import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationsController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registration = await Registration.findAll({
      order: ['start_date'],
      attributes: [
        'id',
        'active',
        'daysLeft',
        'start_date',
        'end_date',
        'price',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'age'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    return res.json(registration);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id } = req.body;

    const studentExist = await Student.findByPk(student_id);

    if (!studentExist) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const planExist = await Plan.findByPk(plan_id);

    if (!planExist) {
      return res.status(400).json({ error: 'Plan not found' });
    }
    const start_date = parseISO(req.body.start_date);
    const end_date = addMonths(start_date, planExist.duration);
    const price = planExist.price * planExist.duration;

    /**
     * Check user is administrator
     */
    const user = await User.findByPk(req.userId);

    if (!user.profile_admin) {
      return res
        .status(405)
        .json({ error: 'Action allowed for administrators only!' });
    }

    /**
     * Verify student registred
     */
    const registred = await Registration.findOne({ where: { student_id } });
    if (registred) {
      return res.status(400).json({ error: 'Student already registred' });
    }

    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    await Queue.add(RegistrationMail.key, {
      studentExist,
      planExist,
      start_date,
      end_date,
      price,
    });

    return res.json(registration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration not found.' });
    }

    const { student_id, plan_id } = req.body;

    if (student_id !== registration.student_id) {
      const studentExist = await Student.findByPk(student_id);

      if (!studentExist) {
        return res.status(400).json({ error: 'Student not found' });
      }

      const registerExiste = await Registration.findOne({
        where: { student_id },
      });

      if (registerExiste) {
        return res.status(401).json({ error: 'Student already registred' });
      }
    }

    const planExist = await Plan.findByPk(plan_id);

    if (!planExist) {
      return res.status(400).json({ error: 'Plan not found' });
    }
    const start_date = parseISO(req.body.start_date);
    const end_date = addMonths(start_date, planExist.duration);
    const price = planExist.price * planExist.duration;

    /**
     * Check user is administrator
     */
    const user = await User.findByPk(req.userId);

    if (!user.profile_admin) {
      return res
        .status(405)
        .json({ error: 'Action allowed for administrators only!' });
    }

    const { id } = await registration.update({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json({
      id,
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    /**
     * Check user is administrator
     */
    const user = await User.findByPk(req.userId);

    if (!user.profile_admin) {
      return res
        .status(405)
        .json({ error: 'Action allowed for administrators only!' });
    }

    await Registration.destroy({ where: { id: req.params.id } });
    return res.json({
      Success: `Registration ${registration.id}, Successfully deleted!`,
    });
  }
}

export default new RegistrationsController();
