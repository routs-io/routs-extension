export interface IToasterState {
  toaster: IToaster | null
}

export interface IToaster {
  text: string
  color?: TypeAlertColor
}

export type TypeAlertColor = "red" | "orange" | "green" | "blue"
