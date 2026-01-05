// src/pages/OnboardingPage.jsx
import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
  CameraIcon,
  MessageCircleMore,
} from "lucide-react";
import { LANGUAGES } from "../constants";
import { completeOnboarding } from "../lib/api";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [avatarError, setAvatarError] = useState(false);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Onboarding failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  // ✅ DiceBear random avatar (bottts style)
  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 10); // random string
    const randomAvatar = `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}`;
    setAvatarError(false);
    setFormState((prev) => ({ ...prev, profilePic: randomAvatar }));
    toast.success("Random avatar generated!");
  };

  const handleAvatarError = () => {
    setAvatarError(true);
    setFormState((prev) => ({
      ...prev,
      profilePic: "",
    }));
  };

  return (
    <div
      data-theme="light"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e5fff6] via-[#ece5dd] to-[#f0f2f5] px-3 sm:px-4 py-6"
    >
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
          {/* Chat‑style header */}
          <div className="relative bg-gradient-to-r from-[#075e54] via-[#128c7e] to-[#25d366] text-white px-5 sm:px-8 py-4 sm:py-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center rounded-2xl bg-white/15 p-1.5">
                  <MessageCircleMore className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    Finish setting up your chat profile
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80">
                    A friendly profile helps you find better conversation partners.
                  </p>
                </div>
              </div>

              {/* Mini chat preview pill */}
              <div className="flex items-center gap-2 bg-black/15 px-3 py-1.5 rounded-full border border-white/20 text-[11px] sm:text-xs">
                <div className="w-6 h-6 rounded-full bg-[#e2f9f1]" />
                <span className="truncate">
                  “Hi! 👋 Want to practice {formState.learningLanguage || "English"}?”
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
            {/* Top: avatar + quick info + tiny chat card */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-5">
              {/* Left: avatar + name + location */}
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                {/* Avatar block */}
                <div className="flex flex-col items-center justify-center gap-3 md:w-1/3">
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#f0f2f5] overflow-hidden border border-gray-200 shadow-md flex items-center justify-center">
                      {formState.profilePic && !avatarError ? (
                        <img
                          src={formState.profilePic}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                          onError={handleAvatarError}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <CameraIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
                          <span className="text-[10px] text-center px-3">
                            Add a friendly profile picture
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Button: make it full text visible and responsive */}
                  <button
                    type="button"
                    onClick={handleRandomAvatar}
                    className="btn border-none bg-[#128c7e] hover:bg-[#075e54] text-white text-xs sm:text-sm rounded-full px-4 py-2 flex items-center gap-2"
                  >
                    <ShuffleIcon className="w-3 h-3" />
                    <span className="whitespace-nowrap">Random avatar</span>
                  </button>
                </div>

                {/* Name + location */}
                <div className="flex-1 space-y-3">
                  {/* Full Name */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs sm:text-sm font-medium">
                        Display name
                      </span>
                      <span className="text-[10px] text-gray-400">
                        This name is shown in chats
                      </span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formState.fullName}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="input input-bordered w-full text-sm bg-[#f7f9fa]"
                      placeholder="How should others see you?"
                    />
                  </div>

                  {/* Location */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs sm:text-sm font-medium">
                        Location
                      </span>
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-base-content opacity-70" />
                      <input
                        type="text"
                        name="location"
                        value={formState.location}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="input input-bordered w-full pl-9 text-sm bg-[#f7f9fa]"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: small chat preview card */}
              <div className="hidden md:block">
                <div className="bg-[#f7f9fa] rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#e2f9f1]" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          {formState.fullName || "New language partner"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formState.location || "Location not set"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-gray-600 border border-gray-200">
                      Online
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#e2f9f1]" />
                      <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-white text-gray-800 px-3 py-2 shadow-sm">
                        <p>Hi! 👋 Want to practice together?</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-[#e2f9f1] text-gray-900 px-3 py-2 shadow-sm">
                        <p>
                          I am a native {formState.nativeLanguage || "English"} speaker and
                          learning {formState.learningLanguage || "Spanish"}.
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#25d366]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs sm:text-sm font-medium">
                  Short bio
                </span>
                <span className="text-[10px] text-gray-400">
                  Share your interests and language goals
                </span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, bio: e.target.value }))
                }
                className="textarea textarea-bordered h-24 text-sm bg-[#f7f9fa]"
                placeholder="Example: I’m a student who loves movies and wants to improve my speaking confidence."
              />
            </div>

            {/* Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Native language */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs sm:text-sm font-medium">
                    Native language
                  </span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      nativeLanguage: e.target.value,
                    }))
                  }
                  className="select select-bordered w-full text-sm bg-[#f7f9fa]"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES?.map((lang) => (
                    <option
                      key={`native-${lang}`}
                      value={lang.toLowerCase()}
                    >
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Learning language */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs sm:text-sm font-medium">
                    Learning language
                  </span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      learningLanguage: e.target.value,
                    }))
                  }
                  className="select select-bordered w-full text-sm bg-[#f7f9fa]"
                >
                  <option value="">
                    Select language you're learning
                  </option>
                  {LANGUAGES?.map((lang) => (
                    <option
                      key={`learning-${lang}`}
                      value={lang.toLowerCase()}
                    >
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn w-full border-none bg-[#128c7e] hover:bg-[#075e54] text-white rounded-xl text-sm sm:text-base font-semibold shadow-lg shadow-[#128c7e]/25 mt-2"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="w-5 h-5 mr-2" />
                  Complete onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin w-5 h-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
