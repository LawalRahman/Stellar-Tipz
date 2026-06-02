import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import i18n from "./config";
import { I18nProvider, LANGUAGE_STORAGE_KEY, useI18n } from ".";

const GreetingProbe = () => {
  const { t } = useI18n();
  return <h1>{t("landing.hero.heading")}</h1>;
};

const renderProbe = () =>
  render(
    <I18nProvider>
      <GreetingProbe />
    </I18nProvider>,
  );

describe("i18n", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await act(async () => {
      await i18n.changeLanguage("en");
    });
    window.localStorage.clear();
  });

  it("defaults to English", () => {
    renderProbe();

    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it("switches to Spanish", async () => {
    renderProbe();

    await act(async () => {
      await i18n.changeLanguage("es");
    });

    await waitFor(() => {
      expect(screen.getByText(/bienvenido/i)).toBeInTheDocument();
    });
  });

  it("persists language choice", async () => {
    await act(async () => {
      await i18n.changeLanguage("fr");
    });

    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("fr");
  });
});
