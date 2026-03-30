import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Form, Input, Select, DatePicker, Steps } from "antd";
import {
  User,
  Briefcase,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/ui/SectionCard';

const ProgrammaticDatePicker = ({ fieldName, form, ...props }) => (
  <DatePicker
    {...props}
    onChange={(val, dateString) => {
      form.setFieldValue(fieldName, val);
      form.validateFields([fieldName]).catch(() => {});
    }}
    onBlur={(e) => {
      const raw = e?.target?.value?.trim() || "";
      if (raw.length >= 8) {
        const parsed = dayjs(raw, "YYYY-MM-DD", true);
        if (parsed.isValid()) {
          form.setFieldValue(fieldName, parsed);
          form.validateFields([fieldName]).catch(() => {});
        }
      }
    }}
  />
);

/* ── Step config ───────────────────────────────── */
const STEPS = [
  {
    key: "personal",
    label: "Personal",
    icon: User,
    sub: "Identity & basic info",
  },
  {
    key: "employment",
    label: "Employment",
    icon: Briefcase,
    sub: "Role & department",
  },
  {
    key: "salary",
    label: "Salary & Bank",
    icon: CreditCard,
    sub: "Compensation details",
  },
];

const DEPARTMENTS = [
  "HR",
  "IT",
  "Finance",
  "Engineering",
  "Marketing",
  "Operations",
  "Sales",
  "Administration",
];
const CONTRACT_TYPES = ["Permanent", "Contract", "Probation", "Internship"];

/* ── Shared input style ────────────────────────── */
const iStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 9,
  color: "#f9fafb",
  fontSize: 14,
  width: "100%",
};
const Label = ({ children, required }) => (
  <span
    style={{
      color: "#9ca3af",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}
  >
    {children}
    {required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
  </span>
);
const FormGrid = ({ children }) => (
  <div
    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}
  >
    {children}
  </div>
);
const Full = ({ children }) => (
  <div style={{ gridColumn: "span 2" }}>{children}</div>
);

const STEP_FIELDS = {
  0: ["full_name", "nic", "dob", "tin"],
  1: ["designation", "department", "branch", "start_date", "contract_type"],
  2: [
    "bank_name",
    "bank_branch",
    "account_number",
    "basic_salary",
    "hourly_ot_rate",
  ],
};

/* ── Step content panels ───────────────────────── */
const PersonalStep = ({ form }) => {
  return (
  <FormGrid>
    <Full>
      <Form.Item
        name="full_name"
        label={<Label required>Full Name</Label>}
        rules={[{ required: true, message: "Full name is required" }]}
        validateTrigger={["onBlur", "onChange"]}
      >
        <Input size="large" autoFocus placeholder="e.g. Dilshan Perera" style={iStyle} />
      </Form.Item>
    </Full>
    <Form.Item
      name="nic"
      label={<Label required>NIC Number</Label>}
      rules={[
        { required: true, message: "NIC is required" },
        {
          pattern: /^([0-9]{9}[vVxX]|[0-9]{12})$/,
          message: "Invalid NIC format",
        },
      ]}
      validateTrigger={["onBlur", "onChange"]}
    >
      <Input
        size="large"
        placeholder="199012345678 or 940234567V"
        style={iStyle}
        onChange={(e) => {
          form.setFieldsValue({ nic: e.target.value.toUpperCase() });
        }}
      />
    </Form.Item>
    <Form.Item
      name="dob"
      label={<Label required>Date of Birth</Label>}
      rules={[{ required: true, message: "DOB is required" }]}
    >
      <ProgrammaticDatePicker form={form} fieldName="dob" size="large" style={{ ...iStyle, width: "100%" }} />
    </Form.Item>
    <Form.Item name="tin" label={<Label>Tax ID (TIN)</Label>}>
      <Input size="large" placeholder="Optional" style={iStyle} />
    </Form.Item>
  </FormGrid>
  );
};

const EmploymentStep = ({ form }) => {
  return (
  <FormGrid>
    <Form.Item
      name="designation"
      label={<Label required>Designation</Label>}
      rules={[{ required: true, message: "Designation is required" }]}
      validateTrigger={["onBlur", "onChange"]}
    >
      <Input size="large" placeholder="e.g. Software Engineer" style={iStyle} />
    </Form.Item>
    <Form.Item
      name="department"
      label={<Label required>Department</Label>}
      rules={[{ required: true, message: "Department is required" }]}
    >
      <Select
        size="large"
        placeholder="Select Department"
        style={{ ...iStyle }}
        classNames={{ popup: { root: 'dark-select-dropdown' } }}
        options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
      />
    </Form.Item>
    <Form.Item
      name="branch"
      label={<Label required>Branch</Label>}
      rules={[{ required: true, message: "Branch is required" }]}
    >
      <Input size="large" placeholder="e.g. Colombo Main" style={iStyle} />
    </Form.Item>
    <Form.Item
      name="start_date"
      label={<Label required>Start Date</Label>}
      rules={[{ required: true, message: "Start date is required" }]}
    >
      <ProgrammaticDatePicker form={form} fieldName="start_date" size="large" style={{ ...iStyle, width: "100%" }} />
    </Form.Item>
    <Form.Item
      name="contract_type"
      label={<Label required>Contract Type</Label>}
      rules={[{ required: true, message: "Contract type is required" }]}
    >
      <Select
        size="large"
        placeholder="Select Type"
        style={{ ...iStyle }}
        classNames={{ popup: { root: 'dark-select-dropdown' } }}
        options={CONTRACT_TYPES.map((c) => ({ value: c, label: c }))}
      />
    </Form.Item>
  </FormGrid>
  );
};

const SalaryStep = () => {
  return (
  <FormGrid>
    <Form.Item
      name="bank_name"
      label={<Label required>Bank Name</Label>}
      rules={[{ required: true, message: "Bank name is required" }]}
    >
      <Input size="large" placeholder="e.g. Commercial Bank" style={iStyle} />
    </Form.Item>
    <Form.Item
      name="bank_branch"
      label={<Label required>Bank Branch</Label>}
      rules={[{ required: true, message: "Bank branch is required" }]}
    >
      <Input size="large" placeholder="e.g. Colombo 03" style={iStyle} />
    </Form.Item>
    <Full>
      <Form.Item
        name="account_number"
        label={<Label required>Account Number</Label>}
        rules={[{ required: true, message: "Account number is required" }]}
        validateTrigger={["onBlur", "onChange"]}
      >
        <Input
          size="large"
          placeholder="e.g. 1002345678"
          style={{ ...iStyle, fontFamily: "monospace" }}
        />
      </Form.Item>
    </Full>
    <Form.Item
      name="basic_salary"
      label={<Label required>Basic Salary (LKR)</Label>}
      rules={[{ required: true, message: "Basic salary is required" }]}
      validateTrigger={["onBlur", "onChange"]}
    >
      <Input
        size="large"
        prefix={<span style={{ color: "#4b5563", fontSize: 13 }}>Rs.</span>}
        type="number"
        placeholder="0.00"
        style={iStyle}
      />
    </Form.Item>
    <Form.Item
      name="hourly_ot_rate"
      label={<Label required>Hourly OT Rate (LKR)</Label>}
      rules={[{ required: true, message: "OT rate is required" }]}
      validateTrigger={["onBlur", "onChange"]}
    >
      <Input
        size="large"
        prefix={<span style={{ color: "#4b5563", fontSize: 13 }}>Rs.</span>}
        type="number"
        placeholder="0.00"
        style={iStyle}
      />
    </Form.Item>
  </FormGrid>
  );
};

/* ── Main ───────────────────────────────────────── */
const EmployeeRegistrationForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !done) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, done]);

  const next = async () => {
    try {
      console.log('val before: ', form.getFieldsValue(true));
      await form.validateFields(STEP_FIELDS[current]);
      console.log('val after: ', form.getFieldsValue(true));
      setCurrent((c) => c + 1);
    } catch (e) {
      console.error('val error: ', e);
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const allValues = form.getFieldsValue(true);
      const payload = {
        ...allValues,
        dob: allValues.dob.format("YYYY-MM-DD"),
        start_date: allValues.start_date.format("YYYY-MM-DD"),
        basic_salary: Number(allValues.basic_salary),
        hourly_ot_rate: Number(allValues.hourly_ot_rate),
      };
      const res = await api.post("/api/employees", payload);
      if (res.data?.success) {
        setDone(true);
        setTimeout(() => navigate("/employees"), 2000);
      }
    } catch (err) {
      if (
        err?.response?.status === 409 &&
        err?.response?.data?.code === "DUPLICATE_NIC"
      ) {
        form.setFields([
          { name: "nic", errors: ["An employee with this NIC already exists"] },
        ]);
        setCurrent(0);
      }
    } finally {
      setSaving(false);
    }
  };

  const stepContent = [
    <PersonalStep form={form} />,
    <EmploymentStep form={form} />,
    <SalaryStep />,
  ];

  /* Success screen */
  if (done)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 480,
          fontFamily: "'DM Sans','Segoe UI',sans-serif",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              margin: "0 auto 20px",
              background: "rgba(16,185,129,0.12)",
              border: "2px solid rgba(16,185,129,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(16,185,129,0.2)",
            }}
          >
            <CheckCircle size={36} style={{ color: "#10b981" }} />
          </div>
          <h2
            style={{
              color: "#f9fafb",
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            Employee Registered
          </h2>
          <p style={{ color: "#4b5563", fontSize: 14 }}>
            Redirecting to directory…
          </p>
        </motion.div>
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 740,
        margin: "0 auto",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        padding: "0 0 40px",
      }}
    >
      {/* Page header */}
      <PageHeader
        title="Register New Employee"
        subtitle="Complete all three steps to add the employee to the system"
        breadcrumb={
          <>
            <button
              onClick={() => navigate("/employees")}
              style={{
                background: "none",
                border: "none",
                color: "#4b5563",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              <ArrowLeft size={14} /> Directory
            </button>
            <span style={{ color: "#1f2937" }}>/</span>
            <span style={{ color: "#9ca3af", fontSize: 13 }}>
              Register Employee
            </span>
          </>
        }
      />

      {/* Card */}
      <SectionCard delay={0.08}>
        <Steps
          current={current}
          style={{ marginBottom: 36 }}
          className="dark-steps"
          items={STEPS.map((step) => ({
            title: step.label,
            content: step.sub,
            icon: <step.icon size={18} />,
          }))}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          onValuesChange={() => setIsDirty(true)}
        >
          <div style={{ minHeight: 280 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
              >
                {stepContent[current]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 32,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {current > 0 ? (
              <button
                type="button"
                onClick={() => setCurrent((c) => c - 1)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 9,
                  padding: "10px 18px",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit",
                }}
              >
                <ChevronLeft size={15} /> Previous
              </button>
            ) : (
              <div />
            )}

            {current < STEPS.length - 1 ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={next}
                style={{
                  background: "linear-gradient(135deg,#059669,#10b981)",
                  border: "none",
                  borderRadius: 9,
                  padding: "10px 22px",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                }}
              >
                Next Step <ChevronRight size={15} />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={saving}
                style={{
                  background: saving
                    ? "rgba(16,185,129,0.5)"
                    : "linear-gradient(135deg,#059669,#10b981)",
                  border: "none",
                  borderRadius: 9,
                  padding: "10px 24px",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "inherit",
                  boxShadow: saving
                    ? "none"
                    : "0 4px 16px rgba(16,185,129,0.35)",
                }}
              >
                {saving ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />{" "}
                    Registering…
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} /> Complete Registration
                  </>
                )}
              </motion.button>
            )}
          </div>
        </Form>
      </SectionCard>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ant-input, .ant-input-number-input { background: transparent !important; color: #f9fafb !important; }
        .ant-input::placeholder { color: #374151 !important; }
        .ant-input-affix-wrapper { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.08) !important; border-radius: 9px !important; }
        .ant-select-selector { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 9px !important; color: #9ca3af !important; }
        .ant-select-selection-placeholder { color: #374151 !important; }
        .ant-select-arrow { color: #4b5563 !important; }
        .ant-picker { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.08) !important; border-radius: 9px !important; }
        .ant-picker-input > input { color: #f9fafb !important; }
        .ant-picker-input > input::placeholder { color: #374151 !important; }
        .ant-form-item-label > label { color: #9ca3af !important; }
        .ant-form-item-explain-error { color: #f87171 !important; font-size: 12px !important; }
        .ant-form-item { margin-bottom: 18px !important; }
        .dark-select-dropdown { background: rgba(8,20,13,0.98) !important; border: 1px solid rgba(16,185,129,0.15) !important; border-radius: 10px !important; }
        .dark-select-dropdown .ant-select-item { color: #9ca3af !important; }
        .dark-select-dropdown .ant-select-item-option-active { background: rgba(16,185,129,0.08) !important; }
        .dark-select-dropdown .ant-select-item-option-selected { background: rgba(16,185,129,0.15) !important; color: #10b981 !important; }
        
        // .dark-steps .ant-steps-item-process .ant-steps-item-icon { background: rgba(16,185,129,0.15) !important; border-color: #10b981 !important; }
        // .dark-steps .ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon { color: #10b981 !important; }
        // .dark-steps .ant-steps-item-process .ant-steps-item-title { color: #f9fafb !important; font-weight: 600 !important; }
        // .dark-steps .ant-steps-item-process .ant-steps-item-description { color: #9ca3af !important; }
        // .dark-steps .ant-steps-item-wait .ant-steps-item-icon { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.1) !important; }
        // .dark-steps .ant-steps-item-wait .ant-steps-item-icon > .ant-steps-icon { color: #4b5563 !important; }
        // .dark-steps .ant-steps-item-wait .ant-steps-item-title { color: #6b7280 !important; }
        // .dark-steps .ant-steps-item-wait .ant-steps-item-description { color: #4b5563 !important; }
        // .dark-steps .ant-steps-item-finish .ant-steps-item-icon { background: #10b981 !important; border-color: #10b981 !important; }
        // .dark-steps .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon { color: #fff !important; }
        // .dark-steps .ant-steps-item-finish .ant-steps-item-title { color: #d1d5db !important; }
        // .dark-steps .ant-steps-item-finish .ant-steps-item-description { color: #9ca3af !important; }
        // .dark-steps .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after { background-color: rgba(16,185,129,0.4) !important; }
        // .dark-steps .ant-steps-item-tail::after { background-color: rgba(255,255,255,0.08) !important; }
      `}</style>
    </div>
  );
};

export default EmployeeRegistrationForm;
