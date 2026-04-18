import { useUpdateProfileMutation } from "@/redux/features/scout/scoutProfileApi";
import { ScoutProfile, Achievement } from "@/types/scout/profileType";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FormValues } from "./ScoutProfileEdit";

function ProfileEditForm({
  profile,
  onCancel,
}: {
  profile: ScoutProfile;
  onCancel: () => void;
}) {
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    defaultValues: {
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      bio: profile.bio ?? "",
      about: profile.about ?? "",
      location: profile.location ?? "",
      experience_years: profile.experience_years ?? "",
      connections: profile.connections ?? "",
      website: profile.website ?? "",
      twitter: profile.twitter ?? "",
      facebook: profile.facebook ?? "",
      youtube: profile.youtube ?? "",
      profile_visibility: profile.profile_visibility ?? "public",
      contact_requests: profile.contact_requests ?? false,
      show_online_status: profile.show_online_status ?? false,
      activity_history: profile.activity_history ?? false,
      preferred_leagues: profile.preferred_leagues ?? "",
      contact_status: profile.contact_status ?? "",
      availability: profile.availability ?? "",
      specialization: profile.specialization?.join(", ") ?? "",
      achievements: (profile.achievements ?? []).map((a) => ({
        id: a.id,
        club_name: a.club_name ?? "",
        achievement: a.achievement ?? "",
        year: a.year ?? new Date().getFullYear(),
        affiliation_type: a.affiliation_type ?? "",
      })),
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        experience_years: Number(data.experience_years),
        connections: Number(data.connections),
        specialization: data.specialization
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        achievements: data.achievements.map((a) => ({
          ...a,
          year: Number(a.year),
        })) as Achievement[],
      };

      await updateProfile({ id: profile.id, data: payload }).unwrap();
      toast.success("Profile updated!");
      onCancel();
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Your current form content */}
      {/* ... all cards, inputs, FieldArray ... */}

      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-[#1A2160] text-white rounded-lg hover:bg-[#2D3568]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !formState.isDirty}
          onClick={handleSubmit(onSubmit)}
          className="px-6 py-2.5 bg-linear-to-r from-[#7B2FFF] to-[#00D9FF] rounded-lg font-semibold disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}