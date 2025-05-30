import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  DialogOverlay
} from 'solid-headless'
import ImageDrop from './ImageDrop.jsx'
import { createSignal, onMount } from 'solid-js'

export default function ImageUploadDialog(props) {
  // Default to provided ratio or 16:9 if not specified
  const parseRatio = (ratioStr) => {
    const [w, h] = ratioStr.split(':').map((num) => parseInt(num))
    return { width: w, height: h }
  }

  const defaultValues = props.defaultRatio
    ? parseRatio(props.defaultRatio)
    : { width: 16, height: 9 }

  const [width, setWidth] = createSignal(defaultValues.width)
  const [height, setHeight] = createSignal(defaultValues.height)

  // Set initial ratio from props if provided
  onMount(() => {
    if (props.defaultRatio) {
      const { width: w, height: h } = parseRatio(props.defaultRatio)
      setWidth(w)
      setHeight(h)
    }
  })

  return (
    <Transition appear show={props.isOpen()}>
      <Dialog
        isOpen
        class="fixed inset-0 z-10 overflow-y-auto"
        onClose={props.closeModal}
      >
        <div class="min-h-screen px-4 flex items-center justify-center">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogOverlay class="fixed inset-0 bg-gray-900 bg-opacity-50" />
          </TransitionChild>
          {/* This element is to trick the browser into centering the modal contents. */}
          <span class="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                {props.title}
              </DialogTitle>
              <ImageDrop
                saveImage={props.saveImage}
                aspectRatioWidth={width()}
                aspectRatioHeight={height()}
                closeModal={props.closeModal}
                loading={props.loading}
              />
              {!props.hideRatioSelect && (
                <select
                  class="mt-4"
                  onChange={(e) => {
                    const [w, h] = e.currentTarget.value.split(':')
                    setWidth(parseInt(w))
                    setHeight(parseInt(h))
                  }}
                  value={`${width()}:${height()}`}
                >
                  <option value="16:9">16:9</option>
                  <option value="4:3">4:3</option>
                  <option value="1:1">1:1</option>
                </select>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
