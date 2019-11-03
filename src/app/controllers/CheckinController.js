import { subDays } from 'date-fns';
import Sequelize from 'sequelize';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student is not exists.' });
    }

    const lastCheckin = await Checkin.findOne({
      where: { student_id: student.id },
      attributes: ['id', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    if (lastCheckin) {
      const {
        dataValues: { created_at },
      } = lastCheckin;
      const dateCheckin = created_at;
      const { Op } = Sequelize;

      const blockStartDate = subDays(new Date(), 7);

      if (!(dateCheckin < blockStartDate)) {
        const checkinBlock = await Checkin.findAndCountAll({
          where: {
            created_at: { [Op.gte]: blockStartDate },
            student_id: student.id,
          },
          order: ['created_at'],
        });

        if (checkinBlock.count >= 5) {
          return res.status(401).json({
            error: 'Limit exceeded, You can only do 5 check-ins every 7 days',
          });
        }
      }
    }

    const chekinFinal = await Checkin.create({
      student_id: student.id,
    });

    return res.json(
      `Chekin successfully performed! Student Credential: ${chekinFinal.student_id}`
    );
  }

  async index(req, res) {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student is not exists.' });
    }

    const studentCheckins = await Checkin.findAll({
      where: { student_id: req.params.id },
      attributes: ['id', ['created_at', 'checkin_date']],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'age'],
        },
      ],
      order: [['created_at', 'desc']],
    });

    return res.json(studentCheckins);
  }
}

export default new CheckinController();
