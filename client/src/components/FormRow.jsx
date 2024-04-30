const FormRow = ({
  type,
  name,
  labelText,
  defaultValue,
  onChange,
  disable,
  hidden,
}) => {
  return (
    <div className="form-row">
      <label htmlFor={name} className="form-label">
        {labelText || name}
      </label>
      <input
        hidden={hidden}
        type={type}
        id={name}
        name={name}
        className="form-input"
        defaultValue={defaultValue || ""}
        onChange={onChange}
        disabled={disable}
        required
      />
    </div>
  );
};
export default FormRow;
