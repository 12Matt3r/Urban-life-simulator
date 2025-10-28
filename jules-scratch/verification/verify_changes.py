
from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the local HTML file
        page.goto('file://' + os.path.abspath('index.html'))

        # Wait for the start button to be visible
        start_button = page.locator('button:has-text("Start")')
        expect(start_button).to_be_visible(timeout=10000)

        # Start the game
        start_button.click()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == '__main__':
    run()
