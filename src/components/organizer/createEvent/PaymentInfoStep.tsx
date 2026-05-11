import { Button, Dropdown, Input } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import type { BusinessType } from "../../../types/organizerCreate";
import {
  OrganizerCountedInput,
  OrganizerFormPanel,
} from "../OrganizerFormControls";

export default function PaymentInfoStep() {
  const { t } = useTranslation();
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("0");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("individual");
  const [invoiceName, setInvoiceName] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [taxCode, setTaxCode] = useState("0");
  const businessTypeOptions = [
    {
      value: "organization" as const,
      label: t("organizer.create.payment.organization", "Doanh nghiệp / Tổ chức"),
    },
    {
      value: "individual" as const,
      label: t("organizer.create.payment.individual", "Cá nhân"),
    },
  ];
  const selectedBusinessType =
    businessTypeOptions.find((option) => option.value === businessType) ?? businessTypeOptions[0];

  function handleBusinessTypeChange(key: Key) {
    setBusinessType(key.toString() as BusinessType);
  }

  return (
    <div className="mx-auto max-w-[1434px]">
      <OrganizerFormPanel contentClassName="gap-7 p-5 md:p-6">
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            {t("organizer.create.payment.title", "Thông tin thanh toán")}
          </h2>
          <div className="space-y-1 text-sm leading-6 text-muted">
            <p>
              {t(
                "organizer.create.payment.transferNote",
                "TicketRush sẽ chuyển tiền bán vé đến tài khoản của bạn",
              )}
            </p>
            <p>
              {t(
                "organizer.create.payment.reportNote",
                "Tiền bán vé (sau khi trừ phí dịch vụ cho TicketRush) sẽ vào tài khoản của bạn sau khi xác nhận sale report từ 7 - 10 ngày. Nếu bạn muốn nhận được tiền sớm hơn, vui lòng liên hệ chúng tôi qua số 1900.6408 hoặc info@ticketrush.vn",
              )}
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[150px_minmax(0,810px)] lg:items-center">
          <label className="text-sm font-bold lg:text-right">
            {t("organizer.create.payment.accountHolder", "Chủ tài khoản:")}
          </label>
          <OrganizerCountedInput value={accountHolder} onChange={setAccountHolder} maxLength={100} />

          <label className="text-sm font-bold lg:text-right">
            {t("organizer.create.payment.accountNumber", "Số tài khoản:")}
          </label>
          <Input
            type="number"
            value={accountNumber}
            onInput={(event) => setAccountNumber(event.currentTarget.value)}
            className="w-full rounded-md border border-border bg-white text-slate-900"
          />

          <label className="text-sm font-bold lg:text-right">
            {t("organizer.create.payment.bankName", "Tên ngân hàng:")}
          </label>
          <OrganizerCountedInput value={bankName} onChange={setBankName} maxLength={100} />

          <label className="text-sm font-bold lg:text-right">
            {t("organizer.create.payment.branchName", "Chi nhánh:")}
          </label>
          <OrganizerCountedInput value={branchName} onChange={setBranchName} maxLength={100} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">
            {t("organizer.create.payment.invoiceTitle", "Hoá đơn đỏ")}
          </h2>

          <div className="grid gap-4 lg:grid-cols-[150px_minmax(0,810px)] lg:items-center">
            <label className="text-sm font-bold lg:text-right" htmlFor="organizer-business-type">
              {t("organizer.create.payment.businessType", "Loại hình kinh doanh:")}
            </label>
            <Dropdown>
              <Dropdown.Trigger>
                <Button
                  id="organizer-business-type"
                  variant="tertiary"
                  className="h-10 w-full justify-between rounded-md border border-border bg-white px-3 text-left text-sm font-normal text-slate-900 hover:bg-white/90"
                >
                  {selectedBusinessType.label}
                  <ChevronDown className="size-4 text-slate-500" />
                </Button>
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu
                  onAction={handleBusinessTypeChange}
                  selectionMode="single"
                  selectedKeys={new Set([businessType])}
                >
                  {businessTypeOptions.map((option) => (
                    <Dropdown.Item id={option.value} key={option.value} textValue={option.label}>
                      <Dropdown.ItemIndicator />
                      <span>{option.label}</span>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>

            <label className="text-sm font-bold lg:text-right">
              {t("organizer.create.payment.invoiceName", "Họ tên:")}
            </label>
            <OrganizerCountedInput value={invoiceName} onChange={setInvoiceName} maxLength={100} />

            <label className="text-sm font-bold lg:text-right">
              {t("organizer.create.payment.invoiceAddress", "Địa chỉ:")}
            </label>
            <OrganizerCountedInput value={invoiceAddress} onChange={setInvoiceAddress} maxLength={100} />

            <label className="text-sm font-bold lg:text-right">
              {t("organizer.create.payment.taxCode", "Mã số thuế:")}
            </label>
            <Input
              type="text"
              value={taxCode}
              onInput={(event) => setTaxCode(event.currentTarget.value)}
              className="w-full rounded-md border border-border bg-white text-slate-900"
            />
          </div>
        </section>
      </OrganizerFormPanel>
    </div>
  );
}
