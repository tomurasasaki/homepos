import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async getEmployees(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenant_id: tenantId },
      include: { attendances: true },
      orderBy: { name: 'asc' },
    });
  }

  async createEmployee(tenantId: string, dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        tenant_id: tenantId,
        name: dto.name,
        position: dto.position,
        salary: dto.salary,
      },
    });
  }

  async clockIn(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenant_id: tenantId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const activeAttendance = await this.prisma.attendance.findFirst({
      where: {
        employee_id: employeeId,
        tenant_id: tenantId,
        check_out: null,
      },
    });

    if (activeAttendance) {
      throw new BadRequestException('Employee is already clocked in');
    }

    return this.prisma.attendance.create({
      data: {
        tenant_id: tenantId,
        employee_id: employeeId,
        check_in: new Date(),
      },
    });
  }

  async clockOut(tenantId: string, employeeId: string) {
    const activeAttendance = await this.prisma.attendance.findFirst({
      where: {
        employee_id: employeeId,
        tenant_id: tenantId,
        check_out: null,
      },
    });

    if (!activeAttendance) {
      throw new BadRequestException('Employee has not clocked in yet');
    }

    return this.prisma.attendance.update({
      where: { id: activeAttendance.id },
      data: {
        check_out: new Date(),
      },
    });
  }

  async processPayroll(tenantId: string) {
    const employees = await this.getEmployees(tenantId);

    // Simulate payroll calculations & queue logs
    const payrollSummary = employees.map((emp: any) => {
      const workingDays = emp.attendances.filter((a: any) => a.check_out !== null).length;
      const baseSalary = Number(emp.salary);
      const calculatedPay = workingDays > 0 ? (baseSalary / 22) * workingDays : baseSalary; // standard 22 working days
      return {
        employee_id: emp.id,
        name: emp.name,
        calculatedPay: Math.round(calculatedPay),
      };
    });

    // Write simple journal record for expenses
    const totalExpense = payrollSummary.reduce((sum: number, item: any) => sum + item.calculatedPay, 0);
    await this.prisma.journal.create({
      data: {
        tenant_id: tenantId,
        type: 'EXPENSE',
        reference: `PAYROLL-${new Date().toISOString().slice(0, 7)}`,
        description: `Payroll processed for ${employees.length} employees`,
        amount: totalExpense,
      },
    });

    return {
      message: 'Payroll processed successfully and logged to Journal',
      totalExpense,
      summary: payrollSummary,
    };
  }
}
