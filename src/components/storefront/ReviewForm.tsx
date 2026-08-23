import { useState } from "react";
import { Star, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function ReviewForm({
  productId,
  onSubmit,
}: {
  productId: string;
  onSubmit?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createReview(productId, { rating, title, content });
      toast.success("Review submitted successfully");
      setRating(0);
      setTitle("");
      setContent("");
      onSubmit?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit review",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-xl border bg-card space-y-4"
    >
      <h3 className="font-heading text-lg font-semibold">Write a Review</h3>
      <div>
        <Label className="mb-2 block">Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors cursor-pointer",
                  (hoverRating || rating) >= star
                    ? "fill-primary text-primary"
                    : "text-muted",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="review-title">Review Title</Label>
        <Input
          id="review-title"
          placeholder="Summarize your experience"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          minLength={3}
          maxLength={120}
          required
        />
      </div>
      <div>
        <Label htmlFor="review-content">Your Review</Label>
        <Textarea
          id="review-content"
          placeholder="What did you like or dislike? How did you use the product?"
          rows={4}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          minLength={10}
          maxLength={2000}
          required
        />
      </div>
      <div>
        <Label className="mb-2 block">Add Photos (optional)</Label>
        <label
          className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-not-allowed opacity-60"
          title="Photo uploads are not enabled yet"
        >
          <Camera className="h-5 w-5 text-muted-foreground" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            disabled
          />
        </label>
        <p className="text-xs text-muted-foreground mt-2">
          Photo uploads will be available in a future release.
        </p>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}
