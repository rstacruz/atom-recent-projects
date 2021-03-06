'use babel'
/* global atom */

import SwitcherView from './switcher-view'

/**
 * Manages the modal dialog.
 *
 * @example
 *     modal = new ModalService({
 *       onConfirm: (path) => { ... }
 *     }).activate()
 *
 *     modal.open({
 *       paths: ['/path/to/x', '/path/to/y']
 *     })
 *
 *     modal.close()
 */

export default class ModalService {
  /**
   * Called when the package is activated.
   */

  constructor ({ onConfirm }) {
    // The element to attach to
    this.element = null

    // The atom ModalPanel instance
    this.modalPanel = null

    // The View handler
    this.view = null

    // What was previously focused before opening
    this.previouslyFocusedElement = null

    this.onConfirm = onConfirm
  }

  activate () {
    // The element to attach to
    this.element = document.createElement('div')

    // The atom ModalPanel instance
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.element,
      visible: false
    })

    return this
  }

  /**
   * Opens the switcher; bound to the `switch-project` action.
   */

  open ({ paths } /*: { paths: ProjectList } */) {
    // Idempotency
    if (!this.modalPanel || this.modalPanel.isVisible()) return

    // Save this, so it can be refocused later.
    this.previouslyFocusedElement = document.activeElement

    this.view = new SwitcherView({
      items: paths,
      onConfirm: item => {
        this.onConfirm(item)
        this.close()
      },

      onDismiss: () => {
        this.close()
      }
    })

    this.element.appendChild(this.view.element)
    this.modalPanel.show()
    this.view.focus()
  }

  /**
   * Dismisses the popup
   */

  close () {
    // Idempotency
    if (!this.modalPanel || !this.modalPanel.isVisible()) return

    this.modalPanel.hide()

    // Destroy the view, but keep the modal panel
    if (this.view) {
      this.view.destroy()
      this.view = null
    }

    // Refocus on the editor
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus()
      this.previouslyFocusedElement = null
    }
  }

  /**
   * Completely clean up when the plugin exits
   */

  deactivate () {
    if (this.modalPanel) {
      this.modalPanel.destroy()
      this.modalPanel = null
    }

    if (this.view) {
      this.view.destroy()
      this.view = null
    }
  }
}
