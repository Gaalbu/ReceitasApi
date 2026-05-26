package com.receitasapi.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.receitasapi.api.model.SystemReview;

public interface SystemReviewRepository extends JpaRepository<SystemReview, Long> {
	void deleteByUserUsername(String username);
}

