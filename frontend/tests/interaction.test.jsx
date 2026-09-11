import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Auth from "../src/pages/public/Auth";
import Forecast from "../src/pages/farmer/Forecast";
import { Records } from "../src/components/common/UI";
const state = vi.hoisted(() => ({
  register: vi.fn(),
  notify: vi.fn(),
  get: vi.fn().mockResolvedValue({ items: [] }),
}));
vi.mock("../src/hooks/useApp", () => ({
  useApp: () => ({
    t: (s) => s,
    register: state.register,
    login: vi.fn(),
    notify: state.notify,
    session: { role: "FARMER" },
    data: {
      crops: [{ id: "rice", name: "Rice", status: "Active" }],
      markets: [{ id: "market", name: "Market", status: "Active" }],
      settings: { defaultCrop: "rice" },
    },
  }),
}));
vi.mock("../src/services/forecastService", () => ({
  forecastService: { get: state.get },
}));
const mount = (component) => render(<MemoryRouter>{component}</MemoryRouter>);
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("public registration", () => {
  it("has labeled Farmer fields, no role selector, and unchecked acknowledgment", () => {
    mount(<Auth mode="register" />);
    expect(screen.getByLabelText("First Name")).toBeTruthy();
    expect(screen.getByLabelText("Email Address")).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByRole("checkbox").checked).toBe(false);
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }).getAttribute("href"),
    ).toBe("/privacy-policy");
  });
  it("rejects password mismatch before calling registration", async () => {
    mount(<Auth mode="register" />);
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password-one" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "password-two" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Create Account" }).closest("form"),
    );
    expect(await screen.findByText("Passwords do not match.")).toBeTruthy();
    expect(state.register).not.toHaveBeenCalled();
  });
  it("shows required messages under blank registration fields", async () => {
    mount(<Auth mode="register" />);
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    expect(await screen.findByText("First name is required.")).toBeTruthy();
    expect(screen.getByText("Email address is required.")).toBeTruthy();
    expect(screen.getByText("Password is required.")).toBeTruthy();
    expect(screen.getByText("Please confirm your password.")).toBeTruthy();
  });
  it("password visibility button has an accessible name and changes input type", () => {
    mount(<Auth />);
    const input = screen.getByLabelText("Password");
    expect(input.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeTruthy();
  });
});
it("login displays Remember me beside a right-aligned recovery link", () => {
  mount(<Auth />);
  expect(screen.getByRole("checkbox", { name: "Remember me" }).checked).toBe(false);
  expect(screen.getByRole("link", { name: /forgot password\?/i }).getAttribute("href")).toBe("/forgot-password");
});
it("forecast period uses three pressed-state buttons and requests selected horizon", async () => {
  mount(<Forecast />);
  for (const label of ["1 Month", "3 Months", "6 Months"])
    expect(screen.getByRole("button", { name: label })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "3 Months" }));
  await waitFor(() =>
    expect(state.get).toHaveBeenLastCalledWith({
      cropId: "rice",
      marketId: "market",
      horizonMonths: 3,
    }),
  );
  expect(
    screen
      .getByRole("button", { name: "3 Months" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(await screen.findByText("No forecast available")).toBeTruthy();
});
it("mobile and desktop records preserve the correct action target", () => {
  const select = vi.fn();
  mount(
    <Records
      rows={[
        { id: "a", name: "Rice" },
        { id: "b", name: "Corn" },
      ]}
      columns={[{ key: "name", label: "Crop" }]}
      actions={(r) => (
        <button onClick={() => select(r.id)}>Edit {r.name}</button>
      )}
    />,
  );
  for (const button of screen.getAllByRole("button", { name: "Edit Corn" }))
    fireEvent.click(button);
  expect(select.mock.calls).toEqual([["b"], ["b"]]);
});
