import { render, screen, fireEvent } from "@testing-library/react";
import ProfileFormLayout from "./ProfileFormLayout";

describe("ProfileFormLayout", () => {
  it("renders title, subtitle, and children correctly", () => {
    render(
      <ProfileFormLayout title="Edit Profile" subtitle="Update your info">
        <p>Form goes here</p>
      </ProfileFormLayout>
    );

    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
    expect(screen.getByText("Update your info")).toBeInTheDocument();
    expect(screen.getByText("Form goes here")).toBeInTheDocument();
  });

  it("does not render subtitle if not provided", () => {
    render(
      <ProfileFormLayout title="Edit Profile">
        <p>Only title</p>
      </ProfileFormLayout>
    );

    expect(screen.queryByText("Update your info")).not.toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());

    render(
      <ProfileFormLayout title="Form" onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </ProfileFormLayout>
    );

    fireEvent.click(screen.getByText("Submit"));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
