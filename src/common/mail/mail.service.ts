import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { Booking } from 'src/modules/booking/entities/booking.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendSupplierBookingNotification(
    booking: Booking,
    supplier: Supplier,
  ): Promise<void> {
    const prefix = `[sendSupplierBookingNotification] booking=${booking.bookingCode}`;

    if (!supplier?.email) {
      this.logger.warn(
        `${prefix} skipped: supplier ${supplier?.id} has no email`,
      );
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: supplier.email,
        subject: `New booking confirmed - ${booking.productName} (${booking.bookingCode})`,
        html: this.buildSupplierBookingHtml(booking, supplier),
      });
      this.logger.log(`${prefix} sent to ${supplier.email}`);
    } catch (error) {
      this.logger.error(
        `${prefix} failed to send: ${(error as Error).message}`,
      );
    }
  }

  private buildSupplierBookingHtml(
    booking: Booking,
    supplier: Supplier,
  ): string {
    const travelDate = booking.travelDate
      ? new Date(booking.travelDate).toISOString().slice(0, 10)
      : '-';

    const totalParticipants = (booking.passengers ?? []).reduce(
      (sum, passenger) => sum + passenger.count,
      0,
    );
    const passengerBreakdown = (booking.passengers ?? [])
      .map((passenger) => `${passenger.count} x ${passenger.unitName}`)
      .join(', ');

    const rows = [
      this.row('Booking reference ID', booking.bookingCode),
      this.row('Travel date', travelDate),
      booking.departureTime
        ? this.row('Departure time', booking.departureTime)
        : '',
      booking.departureLabel
        ? this.row('Departure', booking.departureLabel)
        : '',
      this.row('Lead participant', booking.username || '-'),
      this.row('Lead person email', booking.email || '-'),
      this.row('Lead person mobile', booking.phone || '-'),
      this.row(
        'Participant',
        `${totalParticipants} x Person${passengerBreakdown ? ` (${passengerBreakdown})` : ''}`,
      ),
      booking.pickupLocationName
        ? this.row('Pickup location', booking.pickupLocationName)
        : '',
      this.row(
        'Total price',
        `${Number(booking.totalPrice).toLocaleString()} ${booking.currency}`,
      ),
    ].join('');

    const extraDetailsRows = (booking.messengerApp ?? [])
      .map((app) => this.row(app.name, app.username))
      .join('');

    return `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #222;">
  <h2 style="margin-bottom: 4px;">Hey there ${supplier.name} Operation Team,</h2>
  <p style="color: #555;">
    A new booking has been confirmed for <strong>${booking.productName}</strong>${
      booking.optionName ? ` - ${booking.optionName}` : ''
    }. See order details below for your record.
  </p>

  <h3 style="margin-bottom: 8px;">${booking.productName}</h3>
  ${
    booking.optionName
      ? `<div style="background:#eef7f3;color:#1b7a52;display:inline-block;padding:4px 10px;border-radius:4px;font-size:13px;margin-bottom:12px;">Package: ${booking.optionName}</div>`
      : ''
  }

  <table style="width:100%; border-collapse: collapse; border: 1px solid #e5e5e5;">
    ${rows}
  </table>

  ${
    extraDetailsRows
      ? `<h4 style="margin-top:20px; margin-bottom:8px;">Extra Details</h4>
  <table style="width:100%; border-collapse: collapse; border: 1px solid #e5e5e5;">
    ${extraDetailsRows}
  </table>`
      : ''
  }

  <p style="margin-top:24px; color:#555; font-size: 13px;">
    If you have any questions, please contact us. Thank you!
  </p>
  <p style="margin-top: 16px;">Cheers,<br/>Web Travel VVV Team</p>
</div>`;
  }

  private row(label: string, value: string): string {
    return `<tr>
      <td style="padding:10px 12px; color:#666; font-size:13px; border-bottom:1px solid #eee; width:40%;">${label}</td>
      <td style="padding:10px 12px; font-size:13px; border-bottom:1px solid #eee;">${value}</td>
    </tr>`;
  }
}
