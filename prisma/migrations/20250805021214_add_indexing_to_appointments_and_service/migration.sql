-- CreateIndex
CREATE INDEX `Appointment_date_idx` ON `Appointment`(`date`);

-- CreateIndex
CREATE INDEX `Appointment_paid_idx` ON `Appointment`(`paid`);

-- CreateIndex
CREATE INDEX `Service_price_idx` ON `Service`(`price`);

-- RenameIndex
ALTER TABLE `Appointment` RENAME INDEX `Appointment_staffId_fkey` TO `Appointment_staffId_idx`;
