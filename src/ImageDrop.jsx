import 'cropperjs/dist/cropper.css'

import { createEffect, createRenderEffect, createSignal, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import Cropper from 'cropperjs'
import { Icon } from 'solid-heroicons'
import { cloudArrowUp, photo } from 'solid-heroicons/solid'

export default function ImageDrop(props) {
  let cropImage
  let fileInputRef
  const [state, setState] = createStore({
      error: null,
      loading: false,
      file: {},
      croppedImage: null
    }),
    [aspectRatioWidth, setAspectRatioWidth] = createSignal(1),
    [aspectRatioHeight, setAspectRatioHeight] = createSignal(1),
    [dropZoneActive, setDropZoneActive] = createSignal(false),
    [uploading, setUploading] = createSignal(false),
    [preview, setPreview] = createSignal(null),
    [cropper, setCropper] = createSignal(null),
    noPropagate = (e) => {
      e.preventDefault()
    },
    uploadFile = async (file) => {
      if (!file) return
      setUploading(true)
      setState('loading', true)
      setState('file', file)
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target.result)
          setCropper(
            new Cropper(cropImage, {
              aspectRatio: aspectRatioWidth() / aspectRatioHeight(),
              viewMode: 1,
              rotatable: false
            })
          )
        }
        createRenderEffect(() => {})
        reader.readAsDataURL(file)
      } catch (e) {
        console.error('upload failed', e)
        const message = e instanceof Error ? e.message : String(e)
        setState('error', message)
      }
      setState('loading', false)
      setUploading(false)
    },
    setAspectRatio = (width, height) => {
      setAspectRatioWidth(width)
      setAspectRatioHeight(height)
      if (cropper()) {
        cropper().setAspectRatio(width / height)
      }
    },
    handleFileDrop = async (e) => {
      e.preventDefault()
      setDropZoneActive(false)
      uploadFile(e.dataTransfer.files[0])
    },
    handleFileInput = async (e) => {
      e.preventDefault()
      uploadFile(e.currentTarget.files[0])
    },
    triggerFileInput = () => {
      if (!uploading()) {
        fileInputRef.click()
      }
    }

  createEffect(() => {
    if (props.aspectRatioWidth >= 1 && props.aspectRatioHeight >= 1) {
      setAspectRatio(props.aspectRatioWidth, props.aspectRatioHeight)
    }
  })

  return (
    <>
      <Show when={preview() !== null}>
        <div class="w-full max-w-md mx-auto">
          <div class="w-full my-2">
            <img
              ref={cropImage}
              src={preview()}
              alt="cropper"
              class="block w-full max-h-96 object-contain"
            />
          </div>
          <div class="flex gap-2 mt-2">
            <button
              type="button"
              class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => {
                setState(
                  'croppedImage',
                  cropper().getCroppedCanvas().toDataURL(state.file.type)
                )
                props.saveImage(state)
              }}
            >
              <Icon
                path={cloudArrowUp}
                class="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
              Save
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-x-1.5 rounded-md bg-gray-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              onClick={() => {
                if (cropper()) {
                  cropper().destroy()
                }
                setCropper(null)
                setPreview(null)
                setState('croppedImage', null)
                setState('file', {})
                props.closeModal()
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Show>
      <Show when={preview() === null}>
        <form class="w-full max-w-md mx-auto">
          <div
            id="dropzone"
            class={`cursor-pointer ${dropZoneActive() ? 'bg-green-100' : ''} ${
              uploading() && 'opacity-50'
            } place-content-center place-items-center min-h-[16rem] w-full border-2 border-gray-300 border-dashed rounded-md sm:flex p-2 my-2`}
            onDragEnter={() =>
              uploading() ? undefined : setDropZoneActive(true)
            }
            onDragLeave={() => setDropZoneActive(false)}
            onDragOver={noPropagate}
            onDrop={(event) =>
              uploading() ? noPropagate(event) : handleFileDrop(event)
            }
            onClick={triggerFileInput}
          >
            <div class="">
              <Icon
                path={photo}
                class="h-32 w-32 sm:h-48 sm:w-48 text-gray-300 mx-auto"
              />
            </div>
            <input
              id="image-upload"
              name="file"
              type="file"
              disabled={uploading()}
              multiple={false}
              onInput={handleFileInput}
              class="sr-only"
              ref={fileInputRef}
            />
          </div>
          <div class="h-8" />
        </form>
      </Show>
    </>
  )
}
