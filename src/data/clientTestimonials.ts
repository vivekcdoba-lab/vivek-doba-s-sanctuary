/** Add only genuine client stories with permission to publish here. */
export type Testimonial = {
  id: string; name: string; business: string | null; city: string | null;
  photo: string | null; quote: string | null; youtube_id: string | null;
  program_slug: string | null; program_name?: string; result?: string;
  rating: number | null; sort_order: number; is_published: boolean;
  created_at: string; updated_at: string;
};

// Awaiting the client's real names, quotes, program details and approved photos.
export const clientTestimonials: Testimonial[] = [];

export const GOOGLE_REVIEW_LINK = 'https://www.google.com/search?q=Vivek+Doba+Business+Mastery&stick=H4sIAAAAAAAA_-NgU1I1qDBOSjZKSrM0M0w0T0oDAiuDChNL47SUFDNDU2NzQ3OjNMtFrNJhmWWp2Qou-UmJCk6lxZl5qcXFCr6JxSWpRZUARCKbTkcAAAA&hl=en-GB&mat=Cb6XIapqqfI_ElcBzAmVZig4NQKCcjhZJqhWHsORRPvzRT5bJMnRd2XZaI5rwkWlOfj8fAy5cu3RMhMJpEBp_yVI-rntalsJaDOmxCEysQTPw8mJ0BypI7rclU7DdiLwzX8&authuser=0&ved=1t:350944';